import { canvasDb, stageItemDb } from '../db.js';

/**
 * Impact detection rules based on stage dependencies
 */
const IMPACT_RULES = {
  user: ['workflow', 'pain_point', 'opportunity'],
  pain_point: ['root_cause', 'assumption', 'evidence'],
  assumption: ['evidence', 'decision', 'mvp'],
  decision: ['mvp'],
  root_cause: ['assumption', 'evidence'],
  workflow: ['pain_point'],
};

/**
 * Merge AI extraction updates into canvas
 */
export async function mergeCanvasUpdates(canvasId, updates) {
  if (!updates || Object.keys(updates).length === 0) {
    return { updated: [], errors: [] };
  }

  const results = {
    updated: [],
    errors: [],
  };

  for (const [stageName, updateData] of Object.entries(updates)) {
    try {
      // Get stage from database
      const stage = canvasDb.getStageByName(canvasId, stageName);
      
      if (!stage) {
        results.errors.push(`Stage ${stageName} not found`);
        continue;
      }

      // Determine new status based on action
      let newStatus = updateData.status || stage.status;
      
      if (updateData.action === 'replace') {
        // Clear existing items if replacing
        stageItemDb.deleteByStageId(stage.id);
        newStatus = updateData.status || 'partial';
      } else if (updateData.action === 'needs_review') {
        newStatus = 'needs_review';
      }

      // Update stage
      canvasDb.updateStage(stage.id, {
        status: newStatus,
        summary: updateData.summary || stage.summary,
        confidence: updateData.confidence !== undefined ? updateData.confidence : stage.confidence,
      });

      // Add new items if provided
      if (updateData.items) {
        updateData.items.forEach((item, index) => {
          stageItemDb.create(stage.id, item.type, item.content, index);
        });
      }

      results.updated.push({
        stage: stageName,
        status: newStatus,
        action: updateData.action,
      });
    } catch (error) {
      results.errors.push(`Error updating ${stageName}: ${error.message}`);
    }
  }

  return results;
}

/**
 * Detect impact of changes on other stages
 */
export function detectImpact(updates, currentCanvas) {
  const affectedStages = [];

  for (const stageName of Object.keys(updates)) {
    // Check if this stage has impact rules
    if (IMPACT_RULES[stageName]) {
      const impactedStages = IMPACT_RULES[stageName];
      
      impactedStages.forEach(impactedStage => {
        // Check if impacted stage exists and has content
        const stage = currentCanvas.stages.find(s => s.name === impactedStage);
        
        if (stage && stage.status !== 'not_started') {
          affectedStages.push({
            stage: impactedStage,
            reason: `${stageName}_changed`,
            action: 'needs_review',
          });
        }
      });
    }
  }

  return affectedStages;
}

/**
 * Apply impact detection results to canvas
 */
export async function applyImpact(canvasId, affectedStages) {
  const results = [];

  for (const impact of affectedStages) {
    try {
      const stage = canvasDb.getStageByName(canvasId, impact.stage);
      
      if (stage) {
        canvasDb.updateStage(stage.id, {
          status: 'needs_review',
        });
        
        results.push({
          stage: impact.stage,
          status: 'needs_review',
          reason: impact.reason,
        });
      }
    } catch (error) {
      console.error(`Error applying impact to ${impact.stage}:`, error);
    }
  }

  return results;
}

/**
 * Determine stage status based on content
 */
export function determineStageStatus(stage) {
  if (!stage.summary && (!stage.items || stage.items.length === 0)) {
    return 'not_started';
  }

  const hasConfirmed = stage.items?.some(item => item.type === 'confirmed');
  const hasValidation = stage.items?.some(item => item.type === 'needs_validation');

  if (hasConfirmed && !hasValidation && stage.summary) {
    return 'complete';
  }

  if (hasConfirmed || stage.summary) {
    return 'partial';
  }

  return 'not_started';
}

/**
 * Check if all stages are complete
 */
export function checkCompletion(canvas) {
  if (!canvas || !canvas.stages) {
    return {
      isComplete: false,
      completedCount: 0,
      totalCount: 10,
      needsReviewCount: 0,
    };
  }

  const completedCount = canvas.stages.filter(s => s.status === 'complete').length;
  const needsReviewCount = canvas.stages.filter(s => s.status === 'needs_review').length;
  const totalCount = canvas.stages.length;

  return {
    isComplete: completedCount === totalCount && needsReviewCount === 0,
    completedCount,
    totalCount,
    needsReviewCount,
  };
}

/**
 * Identify missing or incomplete stages
 */
export function identifyMissingStages(canvas) {
  if (!canvas || !canvas.stages) {
    return ['idea', 'user', 'workflow'];
  }

  const missing = canvas.stages
    .filter(s => s.status === 'not_started' || s.status === 'needs_review')
    .map(s => s.name)
    .sort((a, b) => {
      const orderA = canvas.stages.find(s => s.name === a)?.order_index || 0;
      const orderB = canvas.stages.find(s => s.name === b)?.order_index || 0;
      return orderA - orderB;
    });

  return missing;
}

/**
 * Select target stage for next question
 */
export function selectTargetStage(canvas, missingStages) {
  // Prioritize by order
  if (missingStages.length > 0) {
    return missingStages[0];
  }

  // If all complete, check for needs_review
  const needsReview = canvas.stages
    .filter(s => s.status === 'needs_review')
    .sort((a, b) => a.order_index - b.order_index);

  if (needsReview.length > 0) {
    return needsReview[0].name;
  }

  // Default to first incomplete stage
  const incomplete = canvas.stages
    .filter(s => s.status === 'partial')
    .sort((a, b) => a.order_index - b.order_index);

  if (incomplete.length > 0) {
    return incomplete[0].name;
  }

  // Fallback to idea
  return 'idea';
}

/**
 * Validate stage transition
 */
export function validateStageTransition(fromStatus, toStatus) {
  const validTransitions = {
    not_started: ['partial', 'complete'],
    partial: ['complete', 'needs_review'],
    complete: ['needs_review', 'partial'],
    needs_review: ['partial', 'complete'],
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
}

/**
 * Calculate overall canvas confidence
 */
export function calculateOverallConfidence(canvas) {
  if (!canvas || !canvas.stages) {
    return 0;
  }

  const stagesWithConfidence = canvas.stages.filter(s => s.confidence !== null && s.confidence !== undefined);
  
  if (stagesWithConfidence.length === 0) {
    return 0;
  }

  const sum = stagesWithConfidence.reduce((acc, s) => acc + s.confidence, 0);
  return Math.round(sum / stagesWithConfidence.length);
}

export default {
  mergeCanvasUpdates,
  detectImpact,
  applyImpact,
  determineStageStatus,
  checkCompletion,
  identifyMissingStages,
  selectTargetStage,
  validateStageTransition,
  calculateOverallConfidence,
};

// Made with Bob
