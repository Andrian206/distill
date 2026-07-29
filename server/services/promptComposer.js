/**
 * Prompt Composer
 * Composes dynamic prompts from multiple components:
 * System + Reasoning State + Conversation Memory + Current Objective + User Message
 */

import SYSTEM_PROMPT from '../prompts/system.js';
import { getModeInstructions } from './modeEngine.js';

/**
 * Compose conversation prompt from components
 * @param {object} components - Prompt components
 * @returns {string} Composed prompt
 */
export function composeConversationPrompt(components) {
    const {
        systemPrompt = SYSTEM_PROMPT,
        reasoningState,
        conversationMemory,
        currentObjective,
        userMessage,
        recentMessages = [],
    } = components;

    return `${systemPrompt}

${formatReasoningState(reasoningState)}

${formatConversationMemory(conversationMemory)}

${formatRecentMessages(recentMessages)}

## Latest User Message
"${userMessage}"

${formatCurrentObjective(currentObjective)}

## Your Task
${getModeInstructions(currentObjective.mode)}

Generate your response now (natural text only, no JSON):`;
}

/**
 * Format reasoning state (stage statuses and confidence)
 * @param {object} reasoningState - Current state of all stages
 * @returns {string} Formatted state
 */
function formatReasoningState(reasoningState) {
    if (!reasoningState || !reasoningState.stages) {
        return '## Reasoning State\nNo stages yet.';
    }

    const stageLines = reasoningState.stages.map(stage => {
        const statusIcon = getStatusIcon(stage.status);
        const confidenceLabel = getConfidenceLabel(stage.confidence);
        const evidenceCount = stage.items ? stage.items.filter(i => i.type === 'confirmed').length : 0;

        let line = `- ${stage.name}: ${statusIcon} ${stage.status} (${stage.confidence}% ${confidenceLabel})`;

        if (evidenceCount > 0) {
            line += ` | ${evidenceCount} evidence`;
        }

        if (stage.contradictions && stage.contradictions.length > 0) {
            line += ` | ⚠️ ${stage.contradictions.length} contradictions`;
        }

        return line;
    });

    return `## Reasoning State
Current progress across all stages:

${stageLines.join('\n')}

Overall Canvas Confidence: ${reasoningState.overallConfidence || 0}%`;
}

/**
 * Format conversation memory (summary of established facts)
 * @param {object} memory - Conversation memory
 * @returns {string} Formatted memory
 */
function formatConversationMemory(memory) {
    if (!memory || Object.keys(memory).length === 0) {
        return '## Conversation Memory\nNo established facts yet.';
    }

    const memoryLines = [];

    if (memory.idea) memoryLines.push(`**Project:** ${memory.idea}`);
    if (memory.user) memoryLines.push(`**Target User:** ${memory.user}`);
    if (memory.workflow) memoryLines.push(`**Current Workflow:** ${memory.workflow}`);
    if (memory.pain_point) memoryLines.push(`**Pain Point:** ${memory.pain_point}`);
    if (memory.root_cause) memoryLines.push(`**Root Cause:** ${memory.root_cause}`);
    if (memory.assumption) memoryLines.push(`**Key Assumption:** ${memory.assumption}`);
    if (memory.evidence) memoryLines.push(`**Evidence:** ${memory.evidence}`);
    if (memory.opportunity) memoryLines.push(`**Opportunity:** ${memory.opportunity}`);
    if (memory.decision) memoryLines.push(`**Decision:** ${memory.decision}`);
    if (memory.mvp) memoryLines.push(`**MVP Scope:** ${memory.mvp}`);

    return `## Conversation Memory
What we've established so far:

${memoryLines.join('\n')}`;
}

/**
 * Format recent messages for context
 * @param {array} messages - Recent messages
 * @returns {string} Formatted messages
 */
function formatRecentMessages(messages) {
    if (!messages || messages.length === 0) {
        return '## Recent Conversation\n(No previous messages)';
    }

    // Filter out system messages (summaries)
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const formatted = conversationMessages
        .slice(-5) // Last 5 conversation messages
        .map(msg => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            return `${role}: "${msg.content}"`;
        })
        .join('\n');

    return `## Recent Conversation (Last ${Math.min(5, conversationMessages.length)} messages)
${formatted}`;
}

/**
 * Format current objective (mode and goal)
 * @param {object} objective - Current objective
 * @returns {string} Formatted objective
 */
function formatCurrentObjective(objective) {
    if (!objective) {
        return '## Current Objective\nMode: clarifying\nGoal: Understand user needs';
    }

    const { mode, targetStage, goal, stageGuidance } = objective;

    return `## Current Objective
**Mode:** ${mode}
**Target Stage:** ${targetStage}
**Goal:** ${goal || stageGuidance || 'Continue discovery'}
${stageGuidance ? `\n**Stage Guidance:** ${stageGuidance}` : ''}`;
}

/**
 * Get status icon
 * @param {string} status - Stage status
 * @returns {string} Icon
 */
function getStatusIcon(status) {
    const icons = {
        not_started: '⚪',
        partial: '🟡',
        complete: '🟢',
        needs_review: '🔴',
    };
    return icons[status] || '⚪';
}

/**
 * Get confidence label
 * @param {number} confidence - Confidence score
 * @returns {string} Label
 */
function getConfidenceLabel(confidence) {
    if (confidence >= 80) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
}

/**
 * Build conversation memory from canvas
 * @param {object} canvas - Canvas state
 * @returns {object} Memory object
 */
export function buildConversationMemory(canvas) {
    if (!canvas || !canvas.stages) return {};

    const memory = {};

    canvas.stages.forEach(stage => {
        if (stage.summary && stage.status !== 'not_started') {
            memory[stage.name] = stage.summary;
        }
    });

    return memory;
}

/**
 * Build reasoning state from canvas
 * @param {object} canvas - Canvas state
 * @returns {object} Reasoning state
 */
export function buildReasoningState(canvas) {
    if (!canvas || !canvas.stages) {
        return { stages: [], overallConfidence: 0 };
    }

    const stages = canvas.stages.map(stage => ({
        name: stage.name,
        status: stage.status,
        confidence: stage.confidence || 0,
        items: stage.items || [],
        contradictions: stage.contradictions ? JSON.parse(stage.contradictions) : [],
    }));

    const overallConfidence = Math.round(
        stages.reduce((sum, s) => sum + s.confidence, 0) / stages.length
    );

    return { stages, overallConfidence };
}

export default {
    composeConversationPrompt,
    buildConversationMemory,
    buildReasoningState,
};

// Made with Bob