import React from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { CanvasCard } from './CanvasCard';

/**
 * CanvasPanel Component
 * Displays all 10 stage cards in vertical layout
 */
export function CanvasPanel() {
  const canvas = useProjectStore(state => state.canvas);
  const selectedStage = useProjectStore(state => state.selectedStage);
  const selectStage = useProjectStore(state => state.selectStage);
  const getCompletionPercentage = useProjectStore(state => state.getCompletionPercentage);

  if (!canvas || !canvas.stages) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No canvas available</p>
          <p className="text-sm mt-2">Create a project to get started</p>
        </div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            🎨 Thinking Canvas
          </h2>
          <span className="text-sm font-medium text-gray-600">
            {completionPercentage}% Complete
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Stage cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {canvas.stages
          .sort((a, b) => a.order_index - b.order_index)
          .map((stage) => (
            <CanvasCard
              key={stage.id}
              stage={stage}
              isSelected={selectedStage === stage.name}
              onClick={() => selectStage(stage.name)}
            />
          ))}
      </div>

      {/* Footer hint */}
      <div className="p-3 bg-white border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Click on a stage to view details
        </p>
      </div>
    </div>
  );
}

export default CanvasPanel;

// Made with Bob
