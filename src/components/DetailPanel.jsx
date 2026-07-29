import React, { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { BlueprintModal } from './BlueprintModal';

/**
 * DetailPanel Component
 * Displays details of the selected stage with 4 sections
 */
export function DetailPanel() {
  const [showBlueprint, setShowBlueprint] = useState(false);
  
  const selectedStage = useProjectStore(state => state.selectedStage);
  const getSelectedStage = useProjectStore(state => state.getSelectedStage);
  const areAllStagesComplete = useProjectStore(state => state.areAllStagesComplete);
  const project = useProjectStore(state => state.project);

  const stage = getSelectedStage();

  if (!selectedStage || !stage) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center text-gray-500 px-8">
          <p className="text-lg font-medium">No stage selected</p>
          <p className="text-sm mt-2">
            Click on a stage card to view its details
          </p>
        </div>
      </div>
    );
  }

  const confirmedItems = stage.items?.filter(item => item.type === 'confirmed') || [];
  const needsValidation = stage.items?.filter(item => item.type === 'needs_validation') || [];
  const nextSteps = stage.items?.filter(item => item.type === 'next_step') || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          📋 Stage Details
        </h2>
        
        {/* Blueprint button */}
        {areAllStagesComplete() && (
          <button
            onClick={() => setShowBlueprint(true)}
            className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            🎯 Generate Blueprint
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Stage header */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {getStageName(stage.name)}
          </h3>
          <div className="flex items-center gap-4">
            <StatusBadge status={stage.status} />
            {stage.confidence !== null && stage.confidence !== undefined && (
              <ConfidenceBadge confidence={stage.confidence} />
            )}
          </div>
        </div>

        {/* Section 1: Summary */}
        <Section title="Summary" icon="📝">
          {stage.summary ? (
            <p className="text-gray-700">{stage.summary}</p>
          ) : (
            <p className="text-gray-400 italic">No summary available yet</p>
          )}
        </Section>

        {/* Section 2: Confirmed Items */}
        <Section title="Confirmed" icon="✅">
          {confirmedItems.length > 0 ? (
            <ul className="space-y-2">
              {confirmedItems
                .sort((a, b) => a.order_index - b.order_index)
                .map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{item.content}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No confirmed items yet</p>
          )}
        </Section>

        {/* Section 3: Needs Validation */}
        <Section title="Needs Validation" icon="❓">
          {needsValidation.length > 0 ? (
            <ul className="space-y-2">
              {needsValidation
                .sort((a, b) => a.order_index - b.order_index)
                .map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">?</span>
                    <span className="text-gray-700">{item.content}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No items need validation</p>
          )}
        </Section>

        {/* Section 4: Next Steps */}
        <Section title="Next Steps" icon="→">
          {nextSteps.length > 0 ? (
            <ul className="space-y-2">
              {nextSteps
                .sort((a, b) => a.order_index - b.order_index)
                .map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">→</span>
                    <span className="text-gray-700">{item.content}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No next steps defined</p>
          )}
        </Section>
      </div>

      {/* Blueprint Modal */}
      {showBlueprint && (
        <BlueprintModal
          projectId={project?.id}
          onClose={() => setShowBlueprint(false)}
        />
      )}
    </div>
  );
}

/**
 * Section Component
 */
function Section({ title, icon, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h4>
      <div className="pl-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }) {
  const statusConfig = {
    not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
    partial: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
    complete: { label: 'Complete', color: 'bg-green-100 text-green-700' },
    needs_review: { label: 'Needs Review', color: 'bg-red-100 text-red-700' },
  };

  const config = statusConfig[status] || statusConfig.not_started;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

/**
 * Confidence Badge Component
 */
function ConfidenceBadge({ confidence }) {
  const getColor = () => {
    if (confidence >= 80) return 'bg-green-100 text-green-700';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      Confidence: {confidence}%
    </span>
  );
}

/**
 * Get human-readable stage name
 */
function getStageName(name) {
  const names = {
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
  return names[name] || name;
}

export default DetailPanel;

// Made with Bob
