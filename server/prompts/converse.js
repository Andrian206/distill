// Prompt B: Conversation Response
// Generates natural language responses with focused questions

export function buildConversationPrompt(userMessage, canvasState, targetStage, extractionResult, recentMessages = []) {
  const canvasContext = formatCanvasForPrompt(canvasState);
  const updatesContext = formatUpdatesForPrompt(extractionResult);
  const stageGuidance = getStageGuidance(targetStage);
  const conversationHistory = formatRecentMessages(recentMessages);

  return `${canvasContext}

${conversationHistory}

## User's Last Message
"${userMessage}"

## Canvas Updates Made
${updatesContext}

## Target Stage for Next Question
${targetStage}: ${stageGuidance}

## Your Task
Generate a natural conversation response that:
1. Acknowledges what the user shared (1 sentence)
2. Provides brief feedback if relevant (optional, 1 sentence)
3. Asks ONE focused question about the target stage (1 question)

## Language Instruction
**CRITICAL: Detect the language of the user's message and respond in the SAME language.**
User's message: "${userMessage}"
Your response MUST be in the same language as the user's message above.

## Response Guidelines
- Keep total response under 3 sentences
- Ask exactly ONE primary question
- Make the question specific and actionable
- Use natural language, avoid mentioning "stages" or "canvas"
- Don't praise excessively or agree blindly
- Challenge assumptions gently when appropriate
- Focus on evidence and facts, not opinions
- If user is off-topic, gently redirect to discovery
- Match the user's language automatically (Indonesian, English, or any other)

## Example Good Responses

User: "I want to build an app for teachers to record student data"
Response: "Got it — teachers are your main users. To understand the problem better, could you walk me through how they currently record student data? What tools do they use today?"

User: "They use paper notebooks and Excel spreadsheets"
Response: "Interesting. Which part of that process takes the most time or causes the most frustration for them?"

User: "The repetitive data entry is really annoying"
Response: "That makes sense. Why do you think this repetitive entry happens? Is it a process issue, a tool limitation, or something else?"

## What NOT to Do
- Don't say "Great idea!" or "That's perfect!"
- Don't ask multiple questions in one turn
- Don't provide solutions or recommendations yet
- Don't mention internal concepts like "canvas" or "stages"
- Don't be verbose or academic

Generate your response now (natural text only, no JSON):`;
}

function formatCanvasForPrompt(canvasState) {
  if (!canvasState || !canvasState.stages) {
    return '## Current Canvas State\nEmpty canvas.';
  }

  const completedStages = canvasState.stages
    .filter(s => s.status === 'complete')
    .map(s => `- ${s.name}: "${s.summary}"`)
    .join('\n');

  const partialStages = canvasState.stages
    .filter(s => s.status === 'partial')
    .map(s => `- ${s.name}: "${s.summary || 'in progress'}"`)
    .join('\n');

  return `## Current Canvas State
Completed:
${completedStages || '(none yet)'}

In Progress:
${partialStages || '(none yet)'}`;
}

function formatUpdatesForPrompt(extractionResult) {
  if (!extractionResult || !extractionResult.updates) {
    return 'No updates made.';
  }

  const updates = Object.entries(extractionResult.updates)
    .map(([stage, data]) => `- ${stage}: ${data.action} (${data.status})`)
    .join('\n');

  return updates || 'No updates made.';
}

function getStageGuidance(stageName) {
  const guidance = {
    idea: 'What do you want to build? Get a clear description of the product concept.',
    user: 'Who is the primary user? Identify the specific target audience.',
    workflow: 'How does their current process look? Understand the existing workflow.',
    pain_point: 'Which part is the most difficult or frustrating? Identify the core problem.',
    root_cause: 'Why does this problem happen? Dig into the underlying cause.',
    assumption: 'What do you assume is true but haven\'t proven? Surface hidden assumptions.',
    evidence: 'What evidence supports this? Validate with facts and data.',
    opportunity: 'What opportunity arises from this problem? Define the solution space.',
    decision: 'What decision do you want to make? Commit to a direction.',
    mvp: 'What minimum features must be present? Define the MVP scope.',
  };

  return guidance[stageName] || 'Continue the discovery process.';
}

/**
 * Format recent messages for conversation context
 * Docs §7.10: Only last 5 messages included in prompt context
 */
function formatRecentMessages(messages) {
  if (!messages || messages.length === 0) {
    return '## Recent Conversation\n(No previous messages)';
  }

  const formatted = messages
    .map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: "${msg.content}"`;
    })
    .join('\n');

  return `## Recent Conversation (Last ${messages.length} messages)\n${formatted}`;
}

export default buildConversationPrompt;

// Made with Bob
