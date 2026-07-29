/**
 * Reflection Prompt
 * Generates synthesis of recent conversation
 * Triggered every 5 messages
 */

export function buildReflectionPrompt(canvas, recentMessages) {
    const canvasContext = formatCanvasForReflection(canvas);
    const conversationContext = formatRecentConversation(recentMessages);

    return `## Reflection Task

You are performing a reflection synthesis after several conversation turns.

${canvasContext}

${conversationContext}

## Your Task

Provide a brief reflection that synthesizes the recent conversation:

**Format:**

**What we've established:**
- [Key point 1 with confidence level]
- [Key point 2 with confidence level]
- [Key point 3 with confidence level]

**What's still unclear:**
- [Gap or ambiguity 1]
- [Gap or ambiguity 2]

**Next focus:**
[What should we explore next and why]

## Guidelines

1. Keep it concise (4-5 sentences total)
2. Reference specific facts from the conversation
3. Highlight confidence levels (high/medium/low)
4. Identify the most critical gap to address
5. Suggest ONE clear next step
6. Use the same language as the user's messages
7. Be direct and factual, not conversational

Generate reflection now:`;
}

function formatCanvasForReflection(canvas) {
    if (!canvas || !canvas.stages) {
        return '## Current Canvas State\nEmpty canvas.';
    }

    const stagesSummary = canvas.stages
        .filter(s => s.status !== 'not_started')
        .map(stage => {
            const confidenceLabel = getConfidenceLabel(stage.confidence);
            const statusIcon = getStatusIcon(stage.status);
            return `- ${stage.name}: ${statusIcon} ${stage.status} (${stage.confidence}% ${confidenceLabel}) - "${stage.summary || 'N/A'}"`;
        })
        .join('\n');

    return `## Current Canvas State

${stagesSummary || '(No stages filled yet)'}`;
}

function formatRecentConversation(messages) {
    if (!messages || messages.length === 0) {
        return '## Recent Conversation\n(No messages)';
    }

    // Get last 5 conversation messages (exclude system)
    const conversationMessages = messages
        .filter(m => m.role !== 'system')
        .slice(-5);

    const formatted = conversationMessages
        .map((msg, idx) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            return `[${idx + 1}] ${role}: "${msg.content}"`;
        })
        .join('\n\n');

    return `## Recent Conversation (Last ${conversationMessages.length} messages)

${formatted}`;
}

function getConfidenceLabel(confidence) {
    if (confidence >= 80) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
}

function getStatusIcon(status) {
    const icons = {
        not_started: '⚪',
        partial: '🟡',
        complete: '🟢',
        needs_review: '🔴',
    };
    return icons[status] || '⚪';
}

export default buildReflectionPrompt;

// Made with Bob