import express from 'express';
import { projectDb, messageDb, canvasDb } from '../db.js';
import { extractInformation, generateResponse } from '../services/aiService.js';
import { mergeCanvasUpdates, detectImpact } from '../services/canvasService.js';

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

    // Get current turn number
    const messages = messageDb.getByProjectId(project_id);
    const turnNumber = messages.length + 1;

    // Save user message
    const userMessage = messageDb.create({
      project_id,
      role: 'user',
      content: message.trim(),
      turn_number: turnNumber
    });

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

    // STEP 2: Merge updates into canvas
    const mergeResult = await mergeCanvasUpdates(
      project.canvas.id,
      extractedInfo.updates
    );

    // STEP 3: Detect impact on other stages
    const impactResult = await detectImpact(
      project.canvas.id,
      extractedInfo.updates
    );

    // STEP 4: Get updated canvas state
    const updatedProject = projectDb.getById(project_id);

    // STEP 5: Generate natural response (Prompt B)
    let aiResponse;
    try {
      aiResponse = await generateResponse(
        message,
        updatedProject.canvas,
        extractedInfo,
        impactResult
      );
    } catch (error) {
      console.error('AI response generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate AI response',
        code: 'AI_ERROR',
        details: error.message
      });
    }

    // STEP 6: Save AI message
    const assistantMessage = messageDb.create({
      project_id,
      role: 'assistant',
      content: aiResponse,
      turn_number: turnNumber + 1
    });

    // Return response with canvas updates
    res.json({
      message: assistantMessage,
      canvas: updatedProject.canvas,
      canvas_updates: extractedInfo.updates,
      impact: impactResult,
      merge_result: mergeResult
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
