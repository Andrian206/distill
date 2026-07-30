// Prompt B: Conversation Response
// Docs §7.04: Generate natural language response with one focused question
// Docs §11 Response Template: [Acknowledgment] + [Brief Feedback] + [One Question]

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
Generate a natural response following this structure:
1. Acknowledge what user shared (1 sentence)
2. Brief feedback if relevant (optional, 1 sentence)
3. Ask ONE focused question about the target stage (1 question)

## Constraints
- Max 3 sentences total
- Exactly ONE question
- Match user's language
- Do not mention "stage" or "canvas" to user

## Example
User: "I want to build an app for teachers"
Response: "Got it — teachers are your main users. To understand the problem better, could you walk me through how they currently record student data?"

Generate your response now:`;
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
    idea: 'What do you want to build?',
    user: 'Who is the primary user?',
    workflow: 'How does their current process look?',
    pain_point: 'Which part is the most difficult?',
    root_cause: 'Why does this problem happen?',
    assumption: 'What do you assume is true?',
    evidence: 'What evidence supports this?',
    opportunity: 'What opportunity arises?',
    decision: 'What decision do you want to make?',
    mvp: 'What minimum features are needed?',
  };
  return guidance[stageName] || 'Continue discovery.';
}

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