/**
 * Prompt Composer
 * Docs §11: Composes dynamic prompts from components:
 * System + Reasoning State + Conversation Memory + Current Objective + User Message
 */

import SYSTEM_PROMPT from '../prompts/system.js';
import { getModeInstructions } from './modeEngine.js';

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

function formatReasoningState(reasoningState) {
    if (!reasoningState || !reasoningState.stages) {
        return '## Reasoning State\nNo stages yet.';
    }

    const stageLines = reasoningState.stages.map(stage => {
        const statusIcon = stage.status === 'complete' ? '🟢' : stage.status === 'partial' ? '🟡' : '⚪';
        const confidenceLabel = stage.confidence >= 80 ? 'high' : stage.confidence >= 50 ? 'medium' : 'low';
        const evidenceCount = stage.items ? stage.items.filter(i => i.type === 'confirmed').length : 0;

        let line = `- ${stage.name}: ${statusIcon} ${stage.status} (${stage.confidence || 0}% ${confidenceLabel})`;
        if (evidenceCount > 0) line += ` | ${evidenceCount} evidence`;
        return line;
    });

    return `## Reasoning State\n${stageLines.join('\n')}\n\nOverall Canvas Confidence: ${reasoningState.overallConfidence || 0}%`;
}

function formatConversationMemory(memory) {
    if (!memory || Object.keys(memory).length === 0) {
        return '## Conversation Memory\nNo established facts yet.';
    }

    const memoryLines = ['idea', 'user', 'workflow', 'pain_point', 'root_cause', 'assumption', 'evidence', 'opportunity', 'decision', 'mvp']
        .filter(key => memory[key])
        .map(key => `**${capitalize(key.replace('_', ' '))}:** ${memory[key]}`);

    return `## Conversation Memory\n${memoryLines.join('\n')}`;
}

function formatRecentMessages(messages) {
    if (!messages || messages.length === 0) {
        return '## Recent Conversation\n(No previous messages)';
    }

    const conversationMessages = messages.filter(m => m.role !== 'system');
    const formatted = conversationMessages
        .slice(-5)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: "${msg.content}"`)
        .join('\n');

    return `## Recent Conversation (Last ${Math.min(5, conversationMessages.length)} messages)\n${formatted}`;
}

function formatCurrentObjective(objective) {
    if (!objective) {
        return '## Current Objective\nMode: clarifying\nGoal: Understand user needs';
    }

    const { mode, targetStage, goal, stageGuidance } = objective;
    const problemStages = ['idea', 'user', 'workflow', 'pain_point', 'root_cause'];
    const isProblemStage = problemStages.includes(targetStage);

    return `## Current Objective
**Mode:** ${mode}
**Target Stage:** ${targetStage}
**Goal:** ${goal || stageGuidance || 'Continue discovery'}
**Scope:** ${isProblemStage ? 'Understand the problem — do NOT evaluate solution' : 'Define what USER can build — do NOT chase edge cases'}`;
}

function capitalize(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function buildConversationMemory(canvas) {
    if (!canvas || !canvas.stages) return {};
    return canvas.stages.reduce((acc, stage) => {
        if (stage.summary && stage.status !== 'not_started') {
            acc[stage.name] = stage.summary;
        }
        return acc;
    }, {});
}

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