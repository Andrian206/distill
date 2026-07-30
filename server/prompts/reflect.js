/**
 * Reflection Prompt
 * Docs §11: Synthesize recent conversation, triggered every 5 messages
 * Format: checkmarks (✓) for established facts, bullets (•) for unclear items
 */

export function buildReflectionPrompt(canvas, recentMessages) {
    const canvasContext = formatCanvasForReflection(canvas);
    const conversationContext = formatRecentConversation(recentMessages);

    return `## Reflection Task

You are synthesizing the recent conversation turns.

${canvasContext}

${conversationContext}

## Your Task
Provide a brief reflection with this EXACT format:

Saya sudah memahami:
✓ [Stage]: [Key insight]
✓ [Stage]: [Key insight]

Masih belum jelas:
• [Stage]: [Specific gap]

Fokus selanjutnya:
[ONE specific next stage]

## Guidelines
1. Use ✓ for established facts, • for unclear items
2. Max 5 established points, 2-3 unclear items
3. Reference specific stages (Idea, User, Workflow, etc.)
4. Suggest ONE clear next step
5. Match user's language
6. Be direct, no fluff

Generate reflection now (use the format above):`;
}

function formatCanvasForReflection(canvas) {
    if (!canvas || !canvas.stages) {
        return '## Current Canvas State\nEmpty canvas.';
    }

    const stagesSummary = canvas.stages
        .filter(s => s.status !== 'not_started')
        .map(stage => {
            const confidenceLabel = stage.confidence >= 80 ? 'high' : stage.confidence >= 50 ? 'medium' : 'low';
            const statusIcon = stage.status === 'complete' ? '🟢' : stage.status === 'partial' ? '🟡' : '🔴';
            return `- ${stage.name}: ${statusIcon} ${stage.status} (${stage.confidence || 0}% ${confidenceLabel}) - "${stage.summary || 'N/A'}"`;
        })
        .join('\n');

    return `## Current Canvas State\n\n${stagesSummary || '(No stages filled yet)'}`;
}

function formatRecentConversation(messages) {
    if (!messages || messages.length === 0) {
        return '## Recent Conversation\n(No messages)';
    }

    const conversationMessages = messages
        .filter(m => m.role !== 'system')
        .slice(-5);

    const formatted = conversationMessages
        .map((msg, idx) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            return `[${idx + 1}] ${role}: "${msg.content}"`;
        })
        .join('\n\n');

    return `## Recent Conversation (Last ${conversationMessages.length} messages)\n\n${formatted}`;
}

export default buildReflectionPrompt;

// Made with Bob