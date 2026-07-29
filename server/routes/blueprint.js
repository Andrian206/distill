import express from 'express';
import { projectDb, blueprintDb } from '../db.js';
import { compileBlueprint, detectContradictions } from '../services/blueprintService.js';
import { distillCanvas, compileBlueprintWithAI } from '../services/aiService.js';

const router = express.Router();

/**
 * GET /api/blueprint/:project_id/preview
 * FR-06-003: Generate blueprint preview without saving (for user review before finalizing)
 */
router.get('/:project_id/preview', async (req, res, next) => {
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

    // Detect contradictions
    const contradictions = detectContradictions(project.canvas);
    if (contradictions.length > 0) {
      return res.status(400).json({
        error: 'Cannot generate blueprint: contradictions detected',
        code: 'CONTRADICTIONS_FOUND',
        contradictions: contradictions
      });
    }

    // Distill canvas
    let distilledCanvas;
    try {
      const distillationResult = await distillCanvas(project.canvas);
      distilledCanvas = {
        ...project.canvas,
        stages: project.canvas.stages.map(stage => {
          const distilled = distillationResult.distilled[stage.name];
          if (distilled) {
            return { ...stage, summary: distilled.summary, confidence: distilled.confidence };
          }
          return stage;
        }),
      };
      if (distillationResult.contradictions && distillationResult.contradictions.length > 0) {
        return res.status(400).json({
          error: 'Contradictions found during distillation',
          code: 'CONTRADICTIONS_FOUND',
          contradictions: distillationResult.contradictions
        });
      }
    } catch (error) {
      console.error('Distillation error:', error);
      distilledCanvas = project.canvas;
    }

    // Compile blueprint (AI with JS fallback)
    let blueprintContent;
    try {
      blueprintContent = await compileBlueprintWithAI(project, distilledCanvas);
    } catch (error) {
      console.error('AI blueprint compilation error:', error);
      try {
        blueprintContent = await compileBlueprint(project, distilledCanvas);
      } catch (fallbackError) {
        console.error('Fallback compilation error:', fallbackError);
        return res.status(500).json({
          error: 'Failed to compile blueprint',
          code: 'AI_ERROR',
          details: error.message
        });
      }
    }

    // Return preview WITHOUT saving
    res.json({
      preview: true,
      project_id,
      content: blueprintContent
    });
  } catch (error) {
    console.error('Blueprint preview error:', error);
    next({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: `Blueprint preview failed: ${error.message}`
    });
  }
});

/**
 * POST /api/blueprint/:project_id
 * Generate blueprint from distilled canvas (saves to DB after approval)
 */
router.post('/:project_id', async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const { approve } = req.body;

    // Validate approval (docs: POST /blueprint requires {approve: true})
    if (approve !== true) {
      return res.status(400).json({
        error: 'Approval required to generate blueprint. Set approve: true in request body.',
        code: 'APPROVAL_REQUIRED'
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

    // STEP 1: Detect contradictions (BR-15: must be resolved before blueprint)
    const contradictions = detectContradictions(project.canvas);
    if (contradictions.length > 0) {
      return res.status(400).json({
        error: 'Cannot generate blueprint: contradictions detected',
        code: 'CONTRADICTIONS_FOUND',
        contradictions: contradictions
      });
    }

    // STEP 2: Distill canvas using AI (Docs §7.7)
    let distilledCanvas;
    try {
      const distillationResult = await distillCanvas(project.canvas);

      // Apply distilled summaries to canvas
      distilledCanvas = {
        ...project.canvas,
        stages: project.canvas.stages.map(stage => {
          const distilled = distillationResult.distilled[stage.name];
          if (distilled) {
            return {
              ...stage,
              summary: distilled.summary,
              confidence: distilled.confidence,
            };
          }
          return stage;
        }),
      };

      // Check for contradictions from AI
      if (distillationResult.contradictions && distillationResult.contradictions.length > 0) {
        return res.status(400).json({
          error: 'Contradictions found during distillation',
          code: 'CONTRADICTIONS_FOUND',
          contradictions: distillationResult.contradictions
        });
      }
    } catch (error) {
      console.error('Distillation error:', error);
      // Fallback to original canvas if distillation fails
      distilledCanvas = project.canvas;
    }

    // STEP 3: Compile blueprint using AI (Docs §7.8)
    let blueprintContent;
    try {
      blueprintContent = await compileBlueprintWithAI(project, distilledCanvas);
    } catch (error) {
      console.error('AI blueprint compilation error:', error);
      // Fallback to JS compilation
      try {
        blueprintContent = await compileBlueprint(project, distilledCanvas);
      } catch (fallbackError) {
        console.error('Fallback compilation error:', fallbackError);
        return res.status(500).json({
          error: 'Failed to compile blueprint',
          code: 'AI_ERROR',
          details: error.message
        });
      }
    }

    // Save blueprint to database (positional args: projectId, content)
    const blueprint = blueprintDb.create(project_id, blueprintContent);

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
