import express from 'express';
import { projectDb, blueprintDb } from '../db.js';
import { compileBlueprint } from '../services/blueprintService.js';

const router = express.Router();

/**
 * POST /api/blueprint/:project_id
 * Generate blueprint from distilled canvas
 */
router.post('/:project_id', async (req, res, next) => {
  try {
    const { project_id } = req.params;

    // Get project with canvas
    const project = projectDb.getById(project_id);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        code: 'NOT_FOUND'
      });
    }

    // Check if all stages are complete
    const incompleteStages = project.canvas.stages.filter(
      stage => stage.status === 'not_started' || stage.status === 'partial'
    );

    if (incompleteStages.length > 0) {
      return res.status(400).json({
        error: 'Cannot generate blueprint: some stages are incomplete',
        code: 'INCOMPLETE_CANVAS',
        incomplete_stages: incompleteStages.map(s => s.name)
      });
    }

    // Check if blueprint already exists
    const existingBlueprint = blueprintDb.getByProjectId(project_id);
    if (existingBlueprint) {
      return res.status(200).json(existingBlueprint);
    }

    // Compile blueprint from canvas
    let blueprintContent;
    try {
      blueprintContent = await compileBlueprint(project.canvas);
    } catch (error) {
      console.error('Blueprint compilation error:', error);
      return res.status(500).json({
        error: 'Failed to compile blueprint',
        code: 'AI_ERROR',
        details: error.message
      });
    }

    // Save blueprint to database
    const blueprint = blueprintDb.create({
      project_id,
      content: blueprintContent
    });

    // Update project status to completed
    projectDb.updateStatus(project_id, 'completed');

    res.status(201).json(blueprint);
  } catch (error) {
    console.error('Blueprint generation error:', error);
    next({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: `Blueprint generation failed: ${error.message}`
    });
  }
});

/**
 * GET /api/blueprint/:project_id
 * Get existing blueprint for a project
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

    // Get blueprint
    const blueprint = blueprintDb.getByProjectId(project_id);
    if (!blueprint) {
      return res.status(404).json({
        error: 'Blueprint not found for this project',
        code: 'NOT_FOUND'
      });
    }

    res.json(blueprint);
  } catch (error) {
    next({
      statusCode: 500,
      code: 'DB_ERROR',
      message: `Failed to retrieve blueprint: ${error.message}`
    });
  }
});

export default router;

// Made with Bob
