import React from 'react';

/**
 * Stage icons mapping
 */
const STAGE_ICONS = {
  idea: '💡',
  user: '👤',
  workflow: '🔄',
  pain_point: '⚠️',
  root_cause: '🌱',
  assumption: '❓',
  evidence: '📄',
  opportunity: '✨',
  decision: '✅',
  mvp: '🚀',
};

/**
 * Stage labels mapping
 */
const STAGE_LABELS = {
  idea: 'Idea',
  user: 'User',
  workflow: 'Workflow',
  pain_point: 'Pain Point',
  root_cause: 'Root Cause',
  assumption: 'Assumption',
  evidence: 'Evidence',
  opportunity: 'Opportunity',
  decision: 'Decision',
  mvp: 'MVP',
};

/**
 * Status color classes
 */
const STATUS_COLORS = {
  not_started: 'bg-gray-100 border-gray-300 text-gray-600',
  partial: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  complete: 'bg-green-50 border-green-300 text-green-800',
  needs_review: 'bg-red-50 border-red-300 text-red-800',
};

/**
 * Status indicators
 */
const STATUS_INDICATORS = {
  not_started: '⚪',
  partial: '🟡',
  complete: '🟢',
  needs_review: '🔴',
};

/**
 * CanvasCard Component
 * Displays a single stage card on the canvas
 */
export function CanvasCard({ stage, isSelected, onClick }) {
  const icon = STAGE_ICONS[stage.name] || '📌';
  const label = STAGE_LABELS[stage.name] || stage.name;
  const statusColor = STATUS_COLORS[stage.status] || STATUS_COLORS.not_started;
  const statusIndicator = STATUS_INDICATORS[stage.status] || '⚪';

  return (
    <div
      onClick={onClick}
      className={`
        border-2 rounded-lg p-4 cursor-pointer transition-all
        hover:shadow-md
        ${statusColor}
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-lg">{label}</h3>
        </div>
        <span className="text-xl" title={stage.status}>
          {statusIndicator}
        </span>
      </div>

      {/* Summary */}
      {stage.summary && (
        <p className="text-sm mb-2 line-clamp-2">
          {stage.summary}
        </p>
      )}

      {/* Confidence Score */}
      {stage.confidence !== null && stage.confidence !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-medium">Confidence:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                stage.confidence >= 80
                  ? 'bg-green-500'
                  : stage.confidence >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${stage.confidence}%` }}
            />
          </div>
          <span className="text-xs font-medium">{stage.confidence}%</span>
        </div>
      )}

      {/* Empty state guidance */}
      {stage.status === 'not_started' && !stage.summary && (
        <p className="text-xs text-gray-500 italic mt-2">
          {getGuidanceText(stage.name)}
        </p>
      )}
    </div>
  );
}

/**
 * Get guidance text for empty stages
 */
function getGuidanceText(stageName) {
  const guidance = {
    idea: 'What do you want to build?',
    user: 'Who is the primary user?',
    workflow: 'How is their current process?',
    pain_point: 'Which part is the most difficult?',
    root_cause: 'Why does this problem happen?',
    assumption: 'What do you assume is true but haven\'t proven?',
    evidence: 'What evidence supports this assumption?',
    opportunity: 'What opportunity arises from this problem?',
    decision: 'What decision do you want to make?',
    mvp: 'What minimum features must be present?',
  };
  
  return guidance[stageName] || 'Click to add details';
}

export default CanvasCard;

// Made with Bob
