import express from 'express';
import { projectDb, messageDb, canvasDb } from '../db.js';
import { extractInformation, generateResponse } from '../services/aiService.js';
import { mergeCanvasUpdates, detectImpact, applyImpact } from '../services/canvasService.js';

const router = express.Router();

/**
 * POST /api/chat
 * Main reasoning pipeline: Extract → Merge → Impact → Respond → Save
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
    const turnNumber = allMessages.length + 1;

    // Limit to last 5 messages for AI context (docs §7.10)
    const recentMessages = allMessages.slice(-5);

    // Save user message (positional args: projectId, role, content, structuredData, turnNumber)
    const userMessage = messageDb.create(
      project_id,
      'user',
      message.trim(),
      null,
      turnNumber
    );

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
        turnNumber + 1
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

    // STEP 3: Detect impact on other stages
    const impactResult = detectImpact(
      extractedInfo.updates,
      project.canvas
    );

    // STEP 3b: Apply impact to database (set affected stages to needs_review)
    let appliedImpact = [];
    if (impactResult.length > 0) {
      appliedImpact = await applyImpact(project.canvas.id, impactResult);
    }

    // STEP 4: Get updated canvas state
    const updatedProject = projectDb.getById(project_id);

    // Determine target stage for next question
    const targetStage = extractedInfo.target_stage || 'idea';

    // STEP 5: Generate natural response (Prompt B)
    // Pass recent messages for context (docs §7.10: last 5 messages)
    // Signature: generateResponse(userMessage, canvasState, targetStage, extractionResult, recentMessages)
    let aiResponse;
    try {
      aiResponse = await generateResponse(
        message,
        updatedProject.canvas,
        targetStage,
        extractedInfo,
        recentMessages
      );
    } catch (error) {
      console.error('AI response generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate AI response',
        code: 'AI_ERROR',
        details: error.message
      });
    }

    // STEP 6: Save AI message (positional args: projectId, role, content, structuredData, turnNumber)
    const assistantMessage = messageDb.create(
      project_id,
      'assistant',
      aiResponse,
      null,
      turnNumber + 1
    );

    // Return response with canvas updates
    res.json({
      message: assistantMessage,
      canvas: updatedProject.canvas,
      canvas_updates: extractedInfo.updates,
      impact: impactResult,
      applied_impact: appliedImpact,
      merge_result: mergeResult,
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