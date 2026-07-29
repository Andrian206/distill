import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProjectStore } from '../store/useProjectStore';

/**
 * BlueprintModal Component
 * Displays the generated blueprint with 11 sections
 */
export function BlueprintModal({ projectId, onClose }) {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBlueprint();
  }, [projectId]);

  const loadBlueprint = async () => {
    setLoading(true);
    setError(null);
    setIsPreview(false);

    try {
      // Try to get existing blueprint first
      let data;
      try {
        data = await api.blueprint.get(projectId);
      } catch (err) {
        // If not found, generate PREVIEW first (FR-06-003: preview before finalizing)
        if (err.status === 404) {
          data = await api.blueprint.preview(projectId);
          setIsPreview(true);
        } else {
          throw err;
        }
      }
      
      setBlueprint(data);
    } catch (err) {
      console.error('Blueprint error:', err);
      setError(err.message || 'Failed to load blueprint');
    } finally {
      setLoading(false);
    }
  };

  // FR-06-003: Approve preview and save to database
  const handleApprove = async () => {
    setSaving(true);
    setError(null);

    try {
      const saved = await api.blueprint.generate(projectId);
      setBlueprint(saved);
      setIsPreview(false);
    } catch (err) {
      console.error('Failed to save blueprint:', err);
      setError(err.message || 'Failed to save blueprint');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!blueprint) return;

    const text = formatBlueprintAsText(blueprint.content);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            🎯 Project Blueprint
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Generating blueprint...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadBlueprint}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {blueprint && !loading && (
            <div className="space-y-6">
              {/* Section 1: Project Name */}
              <BlueprintSection title="1. Project Name" icon="📌">
                <p className="text-lg font-semibold text-gray-800">
                  {blueprint.content.project_name}
                </p>
              </BlueprintSection>

              {/* Section 2: Problem Statement */}
              <BlueprintSection title="2. Problem Statement" icon="❗">
                <p className="text-gray-700">{blueprint.content.problem_statement}</p>
              </BlueprintSection>

              {/* Section 3: Primary User */}
              <BlueprintSection title="3. Primary User" icon="👤">
                <p className="text-gray-700">{blueprint.content.primary_user}</p>
              </BlueprintSection>

              {/* Section 4: Workflow */}
              <BlueprintSection title="4. Current Workflow" icon="🔄">
                <p className="text-gray-700">{blueprint.content.workflow}</p>
              </BlueprintSection>

              {/* Section 5: Core Pain Point */}
              <BlueprintSection title="5. Core Pain Point" icon="⚠️">
                <p className="text-gray-700">{blueprint.content.core_pain_point}</p>
              </BlueprintSection>

              {/* Section 6: Root Cause */}
              <BlueprintSection title="6. Root Cause" icon="🌱">
                <p className="text-gray-700">{blueprint.content.root_cause}</p>
              </BlueprintSection>

              {/* Section 7: Key Evidence */}
              <BlueprintSection title="7. Key Evidence" icon="📄">
                {Array.isArray(blueprint.content.key_evidence) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {blueprint.content.key_evidence.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">{blueprint.content.key_evidence}</p>
                )}
              </BlueprintSection>

              {/* Section 8: Opportunity */}
              <BlueprintSection title="8. Opportunity" icon="✨">
                <p className="text-gray-700">{blueprint.content.opportunity}</p>
              </BlueprintSection>

              {/* Section 9: Decision */}
              <BlueprintSection title="9. Decision" icon="✅">
                <p className="text-gray-700">{blueprint.content.decision}</p>
              </BlueprintSection>

              {/* Section 10: MVP Scope */}
              <BlueprintSection title="10. MVP Scope" icon="🚀">
                {Array.isArray(blueprint.content.mvp_scope) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {blueprint.content.mvp_scope.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">{blueprint.content.mvp_scope}</p>
                )}
              </BlueprintSection>

              {/* Section 11: Next Validation Steps */}
              <BlueprintSection title="11. Next Validation Steps" icon="🔍">
                {Array.isArray(blueprint.content.next_validation) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {blueprint.content.next_validation.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">{blueprint.content.next_validation}</p>
                )}
              </BlueprintSection>

              {/* Reasoning Summary */}
              {blueprint.content.reasoning_summary && (
                <BlueprintSection title="Reasoning Summary" icon="💭">
                  <p className="text-gray-700 italic">{blueprint.content.reasoning_summary}</p>
                </BlueprintSection>
              )}

              {/* Overall Confidence */}
              {blueprint.content.confidence_overall && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Overall Confidence: {blueprint.content.confidence_overall}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview banner (FR-06-003) */}
        {blueprint && !loading && isPreview && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
            <p className="text-sm text-yellow-800">
              📋 This is a <strong>preview</strong>. Review the blueprint above, then approve to save it.
            </p>
          </div>
        )}

        {/* Footer */}
        {blueprint && !loading && (
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
            {isPreview ? (
              <button
                onClick={handleApprove}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? 'Saving...' : '✅ Approve & Save'}
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BlueprintSection Component
 */
function BlueprintSection({ title, icon, children }) {
  return (
    <div className="border-l-4 border-blue-500 pl-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
}

/**
 * Format blueprint as plain text for clipboard
 */
function formatBlueprintAsText(content) {
  const sections = [
    `PROJECT BLUEPRINT\n${'='.repeat(50)}\n`,
    `1. PROJECT NAME\n${content.project_name}\n`,
    `2. PROBLEM STATEMENT\n${content.problem_statement}\n`,
    `3. PRIMARY USER\n${content.primary_user}\n`,
    `4. CURRENT WORKFLOW\n${content.workflow}\n`,
    `5. CORE PAIN POINT\n${content.core_pain_point}\n`,
    `6. ROOT CAUSE\n${content.root_cause}\n`,
    `7. KEY EVIDENCE\n${Array.isArray(content.key_evidence) ? content.key_evidence.map(e => `- ${e}`).join('\n') : content.key_evidence}\n`,
    `8. OPPORTUNITY\n${content.opportunity}\n`,
    `9. DECISION\n${content.decision}\n`,
    `10. MVP SCOPE\n${Array.isArray(content.mvp_scope) ? content.mvp_scope.map(s => `- ${s}`).join('\n') : content.mvp_scope}\n`,
    `11. NEXT VALIDATION STEPS\n${Array.isArray(content.next_validation) ? content.next_validation.map(v => `- ${v}`).join('\n') : content.next_validation}\n`,
  ];

  if (content.reasoning_summary) {
    sections.push(`\nREASONING SUMMARY\n${content.reasoning_summary}\n`);
  }

  if (content.confidence_overall) {
    sections.push(`\nOVERALL CONFIDENCE: ${content.confidence_overall}%`);
  }

  return sections.join('\n');
}

export default BlueprintModal;

// Made with Bob
