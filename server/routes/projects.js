import express from 'express';
import { projectDb, messageDb } from '../db.js';
import { generateGreeting } from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/projects
 * Create a new project with initialized canvas
 * Docs FR-01-001: AI generates a greeting message and opening question
 */
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    // Validate input
    if (name && typeof name !== 'string') {
      return res.status(400).json({
        error: 'Project name must be a string',
        code: 'INVALID_INPUT'
      });
    }

    // Create project (also creates canvas with 10 stages)
    const project = projectDb.create(name || 'Untitled Project');

    // FR-01-001: AI generates a greeting message and opening question
    let greetingMessage = null;
    try {
      const greetingText = await generateGreeting();
      greetingMessage = messageDb.create(
        project.id,
        'assistant',
        greetingText,
        null,
        1
      );
    } catch (error) {
      console.error('Greeting generation failed (non-critical):', error);
      // Fallback greeting if AI fails
      greetingMessage = messageDb.create(
        project.id,
        'assistant',
        "Hi! I'm here to help you transform your idea into a clear project direction. What would you like to build?",
        null,
        1
      );
    }

    res.status(201).json({
      ...project,
      greeting: greetingMessage
    });
  } catch (error) {
    next({
      statusCode: 500,
      code: 'DB_ERROR',
      message: `Failed to create project: ${error.message}`
    });
  }
});

/**
 * GET /api/projects/:id
 * Get project with full canvas data
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get project with canvas and stages
    const project = projectDb.getById(id);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND'
      });
    }

    res.json(project);
  } catch (error) {
    next({
      statusCode: 500,
      code: 'DB_ERROR',
      message: `Failed to retrieve project: ${error.message}`
    });
  }
});

/**
 * GET /api/projects
 * List all projects (sorted by most recent)
 */
router.get('/', async (req, res, next) => {
  try {
    const projects = projectDb.getAll();
    res.json(projects);
  } catch (error) {
    next({
      statusCode: 500,
      code: 'DB_ERROR',
      message: `Failed to list projects: ${error.message}`
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project and all related data (cascade)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = projectDb.getById(id);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND'
      });
    }

    // Delete project (cascade deletes canvas, stages, items, messages, blueprint)
    projectDb.delete(id);

    res.json({
      message: 'Project deleted successfully',
      id
    });
  } catch (error) {
    next({
      statusCode: 500,
      code: 'DB_ERROR',
      message: `Failed to delete project: ${error.message}`
    });
  }
});

export default router;

// Made with Bob
