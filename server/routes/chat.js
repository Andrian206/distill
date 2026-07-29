import express from 'express';
import { projectDb, messageDb, canvasDb } from '../db.js';
import { extractInformation, generateResponse, summarizeMessages } from '../services/aiService.js';
import { mergeCanvasUpdates, detectImpact, applyImpact, selectNextStageWithLock } from '../services/canvasService.js';
import { selectConversationMode, detectMessageType } from '../services/modeEngine.js';
import { composeConversationPrompt, buildConversationMemory, buildReasoningState } from '../services/promptComposer.js';
import { detectContradiction, handleContradiction } from '../services/contradictionEngine.js';
import { detectProgress, trackProgress, calculateOverallProgress } from '../services/progressEngine.js';
import { calculateCanvasConfidence } from '../services/confidenceEngine.js';
import buildReflectionPrompt from '../prompts/reflect.js';

const router = express.Router();

/**
 * POST /api/chat
 * Main reasoning pipeline (docs/11):
 * Extract → Merge → Impact → Contradiction → Mode Select → Respond → Save
 */
router.post('/', async (req, res, next) => {
  try {
    const { project_id, message } = req.body;

    // Validate input
    if (!project_id || !message) {
      return res.status(400).json({
        error: 'project_id and message are required',
        code: 'INVALID_INPUT'
      });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message must be a non-empty string',
        code: 'INVALID_INPUT'
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: 'Message must be less than 2000 characters',
        code: 'INVALID_INPUT'
      });
    }

    // Get project with canvas
    const project = projectDb.getById(project_id);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND'
      });
    }

    // Get chat history (all messages for turn number calculation)
    const allMessages = messageDb.getByProjectId(project_id);
    const lastTurnNumber = messageDb.getLastTurnNumber(project_id);

    // CONTEXT COMPRESSION SYSTEM (docs/10)
    // Every 50 messages, create a summary to maintain manageable context
    const nonSystemCount = allMessages.filter(msg => msg.role !== 'system').length;
    const shouldSummarize = nonSystemCount > 0 && nonSystemCount % 50 === 0;

    if (shouldSummarize) {
      console.log(`📊 Triggering summarization at message ${nonSystemCount}...`);

      // Get messages to summarize (last 50 messages, excluding system summaries)
      const messagesToSummarize = allMessages
        .filter(msg => msg.role !== 'system')
        .slice(-50);

      try {
        // Generate comprehensive summary
        const summary = await summarizeMessages(messagesToSummarize, project.canvas);

        // Save summary as system message with metadata
        // FIX: messageDb.create already JSON.stringify's structuredData internally,
        // so we pass the object directly (not pre-stringified)
        const summaryMetadata = {
          type: 'conversation_summary',
          message_range: `${messagesToSummarize[0]?.turn_number || 1}-${messagesToSummarize[messagesToSummarize.length - 1]?.turn_number || 50}`,
          message_count: messagesToSummarize.length,
          created_at: new Date().toISOString()
        };

        messageDb.create(
          project_id,
          'system',
          summary,
          summaryMetadata,
          lastTurnNumber + 1
        );

        console.log(`✅ Summary created for messages ${summaryMetadata.message_range}`);
      } catch (error) {
        console.error('❌ Summarization failed:', error);
        // Continue without summary - not critical for operation
      }
    }

    // Build context for AI: latest summary + last 50 messages
    const systemMessages = allMessages.filter(msg => msg.role === 'system');
    const latestSummary = systemMessages.length > 0 ? [systemMessages[systemMessages.length - 1]] : [];
    const recentMessages = allMessages
      .filter(msg => msg.role !== 'system')
      .slice(-50);

    // Combine: summary first (if exists), then recent messages
    const contextMessages = [...latestSummary, ...recentMessages];

    console.log(`📝 Context: ${latestSummary.length} summary + ${recentMessages.length} messages = ${contextMessages.length} total`);

    // FIX: Use sequential turn numbers to avoid collision
    const userTurnNumber = lastTurnNumber + 1;
    const aiTurnNumber = lastTurnNumber + 2;

    // Save user message
    const userMessage = messageDb.create(
      project_id,
      'user',
      message.trim(),
      null,
      userTurnNumber
    );

    // Capture previous canvas state for progress tracking
    const previousCanvasState = JSON.parse(JSON.stringify(project.canvas));

    // STEP 1: Extract information from user message (Prompt A)
    let extractedInfo;
    try {
      extractedInfo = await extractInformation(message, project.canvas);
    } catch (error) {
      console.error('AI extraction error:', error);
      return res.status(500).json({
        error: 'Failed to process message with AI',
        code: 'AI_ERROR',
        details: error.message
      });
    }

    // FR-02-004: Handle off-topic messages
    if (extractedInfo.off_topic) {
      const redirectResponse = extractedInfo.redirect_message ||
        "Let's focus on your project. Could you tell me more about what you're trying to build?";

      // Save AI redirect message
      const redirectMessage = messageDb.create(
        project_id,
        'assistant',
        redirectResponse,
        null,
        aiTurnNumber
      );

      return res.json({
        message: redirectMessage,
        canvas: project.canvas,
        canvas_updates: {},
        impact: [],
        applied_impact: [],
        merge_result: { updated: [], errors: [] },
        off_topic: true
      });
    }

    // STEP 2: Merge updates into canvas
    const mergeResult = await mergeCanvasUpdates(
      project.canvas.id,
      extractedInfo.updates
    );

    // STEP 3: Detect impact on other stages (docs/07 §6)
    const impactResult = detectImpact(
      extractedInfo.updates,
      project.canvas
    );

    // STEP 3b: Apply impact to database (set affected stages to needs_review)
    let appliedImpact = [];
    if (impactResult.length > 0) {
      appliedImpact = await applyImpact(project.canvas.id, impactResult);
    }

    // STEP 3c: Contradiction detection (docs/11 §Contradiction Engine)
    let contradictionResults = [];
    if (extractedInfo.updates) {
      for (const [stageName] of Object.entries(extractedInfo.updates)) {
        const stage = canvasDb.getStageByName(project.canvas.id, stageName);
        if (stage) {
          const contradiction = detectContradiction(message, stage);
          if (contradiction) {
            try {
              const result = handleContradiction(stage.id, contradiction);
              contradictionResults.push(result);
            } catch (e) {
              console.error(`Contradiction handling error for ${stageName}:`, e);
            }
          }
        }
      }
    }

    // STEP 4: Get updated canvas state
    const updatedProject = projectDb.getById(project_id);

    // STEP 4b: Progress tracking (docs/11 §Progress Detection)
    let progressResult = null;
    try {
      progressResult = detectProgress(previousCanvasState, updatedProject.canvas);
      trackProgress(project_id, progressResult);
    } catch (e) {
      console.error('Progress tracking error:', e);
    }

    // STEP 5: Determine target stage with Stage Lock mechanism (docs/11 §Stage Lock)
    let targetStage = extractedInfo.target_stage || 'idea';
    const lockedTarget = selectNextStageWithLock(updatedProject.canvas);
    if (lockedTarget) {
      // Use stage lock result if available (respects locked stages)
      targetStage = lockedTarget;
    }

    // STEP 6: Select conversation mode (docs/11 §Conversation Mode Engine)
    const targetStageData = updatedProject.canvas.stages.find(s => s.name === targetStage) || {};
    const messageCount = nonSystemCount + 1; // Include current message
    const hasContradiction = contradictionResults.length > 0;

    let conversationMode = 'clarifying';
    try {
      conversationMode = selectConversationMode({
        stage: targetStageData,
        confidence: targetStageData.confidence || 0,
        userMessage: message,
        messageCount,
        hasContradiction,
        recentMessages: contextMessages,
      });
    } catch (e) {
      console.error('Mode selection error:', e);
    }

    // STEP 7: Generate natural response (Prompt B)
    let aiResponse;
    try {
      // Reflection mode: use reflection prompt (docs/11 §Reflection Engine)
      if (conversationMode === 'reflection') {
        const reflectionPrompt = buildReflectionPrompt(updatedProject.canvas, contextMessages);
        // Call AI directly with reflection prompt
        const { generateResponse: genResp } = await import('../services/aiService.js');
        // Use composeConversationPrompt for reflection with mode instructions
        const reasoningState = buildReasoningState(updatedProject.canvas);
        const conversationMemory = buildConversationMemory(updatedProject.canvas);
        const composedPrompt = composeConversationPrompt({
          reasoningState,
          conversationMemory,
          currentObjective: {
            mode: 'reflection',
            targetStage,
            goal: 'Synthesize recent conversation and identify gaps',
          },
          userMessage: message,
          recentMessages: contextMessages,
        });
        aiResponse = await genResp(message, updatedProject.canvas, targetStage, extractedInfo, contextMessages, composedPrompt);
      } else {
        // Use dynamic prompt composition (docs/11 §Prompt Composition Architecture)
        const reasoningState = buildReasoningState(updatedProject.canvas);
        const conversationMemory = buildConversationMemory(updatedProject.canvas);
        const composedPrompt = composeConversationPrompt({
          reasoningState,
          conversationMemory,
          currentObjective: {
            mode: conversationMode,
            targetStage,
            goal: `Fill ${targetStage} stage via ${conversationMode} mode`,
          },
          userMessage: message,
          recentMessages: contextMessages,
        });
        aiResponse = await generateResponse(
          message,
          updatedProject.canvas,
          targetStage,
          extractedInfo,
          contextMessages,
          composedPrompt
        );
      }
    } catch (error) {
      console.error('AI response generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate AI response',
        code: 'AI_ERROR',
        details: error.message
      });
    }

    // STEP 8: Save AI message
    const assistantMessage = messageDb.create(
      project_id,
      'assistant',
      aiResponse,
      null,
      aiTurnNumber
    );

    // Calculate canvas confidence (docs/11 §Overall Canvas Confidence)
    let canvasConfidence = 0;
    try {
      canvasConfidence = calculateCanvasConfidence(updatedProject.canvas.stages);
    } catch (e) {
      console.error('Canvas confidence calculation error:', e);
    }

    // Return response with canvas updates
    res.json({
      message: assistantMessage,
      canvas: updatedProject.canvas,
      canvas_updates: extractedInfo.updates,
      impact: impactResult,
      applied_impact: appliedImpact,
      merge_result: mergeResult,
      contradictions: contradictionResults,
      conversation_mode: conversationMode,
      target_stage: targetStage,
      canvas_confidence: canvasConfidence,
      progress: progressResult,
      off_topic: false
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    next({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: `Chat processing failed: ${error.message}`
    });
  }
});

/**
 * GET /api/chat/:project_id
 * Get chat history for a project
 */
router.get('/:project_id', async (req, res, next) => {
  try {
    const { project_id } = req.params;

    // Check if project exists
    const project = projectDb.getById(project_id);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND'
      });
    }

    // Get messages
    const messages = messageDb.getByProjectId(project_id);

    res.json(messages);
  } catch (error) {
    next({
      statusCode: 500,
      code: 'DB_ERROR',
      message: `Failed to retrieve chat history: ${error.message}`
    });
  }
});

export default router;

// Made with Bob