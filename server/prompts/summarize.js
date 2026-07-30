/**
 * Conversation Summarization Prompt
 * Docs §10: Context compression, triggered every 50 messages
 */
export default function buildSummarizationPrompt(messages, canvasState) {
    const messageHistory = messages.map((msg, idx) =>
        `[${idx + 1}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');

    return `# TASK: Summarize Conversation

You are summarizing a discovery conversation between a user and an AI assistant.

## Conversation History
${messageHistory}

## Current Canvas State
${JSON.stringify(canvasState, null, 2)}

## Instructions
Create a summary that preserves ALL critical information:

1. **Project**: What is being built? For whom? What problem?
2. **Key Decisions**: All decisions made, rationale, direction changes
3. **Canvas Progress**: What's filled in each stage?
4. **Open Questions**: What's still unanswered or needs validation?
5. **Last Topic**: What was being discussed?

## Output Format
PROJECT: [one-line description]
TARGET USER: [who]
PROBLEM: [what problem]

KEY DECISIONS:
- [decision]

CANVAS PROGRESS:
- Idea: [summary]
- User: [summary]
- Workflow: [summary]
- Pain Point: [summary]
- Root Cause: [summary]
- Assumption: [summary]
- Evidence: [summary]
- Opportunity: [summary]
- Decision: [summary]
- MVP: [summary]

AREAS TO EXPLORE:
- [area]

OPEN QUESTIONS:
- [question]

LAST DISCUSSED: [topic]

IMPORTANT: Match the user's language (Indonesian or English). Generate summary now:`;
}

// Made with Bob