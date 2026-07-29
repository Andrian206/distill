import { blueprintDb, projectDb } from '../db.js';

/**
 * Compile blueprint from distilled canvas
 */
export async function compileBlueprint(project, canvas) {
  if (!canvas || !canvas.stages) {
    throw new Error('Canvas data is required to compile blueprint');
  }

  // Extract stage summaries
  const stages = {};
  canvas.stages.forEach(stage => {
    stages[stage.name] = {
      summary: stage.summary || '',
      confidence: stage.confidence || 0,
      items: stage.items || [],
    };
  });

  // Build blueprint structure
  const blueprint = {
    project_name: project.name || 'Untitled Project',
    
    // 1. Problem Statement (from pain_point)
    problem_statement: stages.pain_point?.summary || 'Problem not yet defined',
    
    // 2. Primary User (from user)
    primary_user: stages.user?.summary || 'User not yet defined',
    
    // 3. Workflow (from workflow)
    workflow: stages.workflow?.summary || 'Workflow not yet defined',
    
    // 4. Core Pain Point (from pain_point)
    core_pain_point: stages.pain_point?.summary || 'Pain point not yet defined',
    
    // 5. Root Cause (from root_cause)
    root_cause: stages.root_cause?.summary || 'Root cause not yet analyzed',
    
    // 6. Key Evidence (from evidence)
    key_evidence: extractConfirmedItems(stages.evidence),
    
    // 7. Opportunity (from opportunity)
    opportunity: stages.opportunity?.summary || 'Opportunity not yet defined',
    
    // 8. Decision (from decision)
    decision: stages.decision?.summary || 'Decision not yet made',
    
    // 9. MVP Scope (from mvp)
    mvp_scope: extractConfirmedItems(stages.mvp),
    
    // 10. Next Validation Steps (from assumption + evidence needs_validation)
    next_validation: extractValidationItems(stages.assumption, stages.evidence),
    
    // 11. Reasoning Summary
    reasoning_summary: generateReasoningSummary(stages),
    
    // Overall confidence
    confidence_overall: calculateOverallConfidence(canvas.stages),
    
    // Metadata
    generated_at: new Date().toISOString(),
    stage_completion: calculateStageCompletion(canvas.stages),
  };

  return blueprint;
}

/**
 * Extract confirmed items from a stage
 */
function extractConfirmedItems(stage) {
  if (!stage || !stage.items) {
    return [];
  }

  return stage.items
    .filter(item => item.type === 'confirmed')
    .map(item => item.content);
}

/**
 * Extract validation items from assumption and evidence stages
 */
function extractValidationItems(assumptionStage, evidenceStage) {
  const validationItems = [];

  if (assumptionStage?.items) {
    assumptionStage.items
      .filter(item => item.type === 'needs_validation')
      .forEach(item => validationItems.push(`Validate: ${item.content}`));
  }

  if (evidenceStage?.items) {
    evidenceStage.items
      .filter(item => item.type === 'needs_validation')
      .forEach(item => validationItems.push(`Gather evidence: ${item.content}`));
  }

  return validationItems.length > 0 ? validationItems : ['No validation steps identified yet'];
}

/**
 * Generate reasoning summary from stages
 */
function generateReasoningSummary(stages) {
  const parts = [];

  // Idea clarity
  if (stages.idea?.summary) {
    parts.push(`The project aims to ${stages.idea.summary.toLowerCase()}`);
  }

  // User focus
  if (stages.user?.summary) {
    parts.push(`targeting ${stages.user.summary.toLowerCase()}`);
  }

  // Problem identification
  if (stages.pain_point?.summary) {
    parts.push(`The core problem is ${stages.pain_point.summary.toLowerCase()}`);
  }

  // Root cause
  if (stages.root_cause?.summary) {
    parts.push(`caused by ${stages.root_cause.summary.toLowerCase()}`);
  }

  // Solution direction
  if (stages.opportunity?.summary) {
    parts.push(`The opportunity lies in ${stages.opportunity.summary.toLowerCase()}`);
  }

  // Decision
  if (stages.decision?.summary) {
    parts.push(`The decision is to ${stages.decision.summary.toLowerCase()}`);
  }

  if (parts.length === 0) {
    return 'Reasoning summary will be generated once more stages are completed.';
  }

  return parts.join('. ') + '.';
}

/**
 * Calculate overall confidence from stages
 */
function calculateOverallConfidence(stages) {
  const stagesWithConfidence = stages.filter(s => s.confidence !== null && s.confidence !== undefined);
  
  if (stagesWithConfidence.length === 0) {
    return 0;
  }

  const sum = stagesWithConfidence.reduce((acc, s) => acc + s.confidence, 0);
  return Math.round(sum / stagesWithConfidence.length);
}

/**
 * Calculate stage completion statistics
 */
function calculateStageCompletion(stages) {
  const total = stages.length;
  const completed = stages.filter(s => s.status === 'complete').length;
  const partial = stages.filter(s => s.status === 'partial').length;
  const needsReview = stages.filter(s => s.status === 'needs_review').length;
  const notStarted = stages.filter(s => s.status === 'not_started').length;

  return {
    total,
    completed,
    partial,
    needs_review: needsReview,
    not_started: notStarted,
    completion_percentage: Math.round((completed / total) * 100),
  };
}

/**
 * Save blueprint to database
 */
export async function saveBlueprint(projectId, blueprintContent) {
  try {
    const blueprint = blueprintDb.create(projectId, blueprintContent);
    
    // Update project status to completed
    projectDb.updateStatus(projectId, 'completed');
    
    return blueprint;
  } catch (error) {
    console.error('Error saving blueprint:', error);
    throw new Error(`Failed to save blueprint: ${error.message}`);
  }
}

/**
 * Distill stage content (merge duplicates, increase confidence)
 */
export function distillStage(stage) {
  if (!stage || !stage.items || stage.items.length === 0) {
    return stage;
  }

  // Group items by type
  const confirmed = stage.items.filter(item => item.type === 'confirmed');
  const needsValidation = stage.items.filter(item => item.type === 'needs_validation');
  const nextSteps = stage.items.filter(item => item.type === 'next_step');

  // Remove duplicates (case-insensitive)
  const uniqueConfirmed = removeDuplicates(confirmed);
  const uniqueValidation = removeDuplicates(needsValidation);
  const uniqueNextSteps = removeDuplicates(nextSteps);

  // Merge similar items
  const mergedConfirmed = mergeSimilarItems(uniqueConfirmed);

  // Calculate confidence boost based on evidence
  let confidenceBoost = 0;
  if (mergedConfirmed.length >= 3) confidenceBoost += 10;
  if (uniqueValidation.length === 0) confidenceBoost += 5;

  return {
    ...stage,
    items: [...mergedConfirmed, ...uniqueValidation, ...uniqueNextSteps],
    confidence: Math.min(100, (stage.confidence || 0) + confidenceBoost),
  };
}

/**
 * Remove duplicate items
 */
function removeDuplicates(items) {
  const seen = new Set();
  return items.filter(item => {
    const normalized = item.content.toLowerCase().trim();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

/**
 * Merge similar items (basic implementation)
 */
function mergeSimilarItems(items) {
  // For MVP, just return deduplicated items
  // In production, could use NLP similarity matching
  return items;
}

/**
 * Detect contradictions across stages
 */
export function detectContradictions(canvas) {
  const contradictions = [];

  if (!canvas || !canvas.stages) {
    return contradictions;
  }

  const stages = {};
  canvas.stages.forEach(stage => {
    stages[stage.name] = stage;
  });

  // Check user vs workflow consistency
  if (stages.user?.summary && stages.workflow?.summary) {
    const userLower = stages.user.summary.toLowerCase();
    const workflowLower = stages.workflow.summary.toLowerCase();
    
    // Simple keyword mismatch detection
    if (userLower.includes('teacher') && workflowLower.includes('parent')) {
      contradictions.push({
        stages: ['user', 'workflow'],
        issue: 'User is defined as teachers but workflow mentions parents',
        severity: 'high',
      });
    }
  }

  // Check pain_point vs opportunity consistency
  if (stages.pain_point?.summary && stages.opportunity?.summary) {
    const painLower = stages.pain_point.summary.toLowerCase();
    const oppLower = stages.opportunity.summary.toLowerCase();
    
    // Check if opportunity addresses the pain point
    if (!oppLower.includes('solve') && !oppLower.includes('address') && !oppLower.includes('reduce')) {
      contradictions.push({
        stages: ['pain_point', 'opportunity'],
        issue: 'Opportunity may not directly address the identified pain point',
        severity: 'medium',
      });
    }
  }

  return contradictions;
}

/**
 * Validate blueprint completeness
 */
export function validateBlueprint(blueprint) {
  const errors = [];
  const warnings = [];

  // Check required fields
  const requiredFields = [
    'project_name',
    'problem_statement',
    'primary_user',
    'core_pain_point',
    'opportunity',
    'decision',
  ];

  requiredFields.forEach(field => {
    if (!blueprint[field] || blueprint[field].includes('not yet')) {
      errors.push(`${field} is incomplete`);
    }
  });

  // Check confidence
  if (blueprint.confidence_overall < 50) {
    warnings.push('Overall confidence is below 50%');
  }

  // Check evidence
  if (!blueprint.key_evidence || blueprint.key_evidence.length === 0) {
    warnings.push('No evidence has been gathered');
  }

  // Check MVP scope
  if (!blueprint.mvp_scope || blueprint.mvp_scope.length === 0) {
    warnings.push('MVP scope is not defined');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default {
  compileBlueprint,
  saveBlueprint,
  distillStage,
  detectContradictions,
  validateBlueprint,
};

// Made with Bob
