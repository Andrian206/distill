// Prompt A: Information Extraction
// Extracts structured information from user messages

export function buildExtractionPrompt(userMessage, canvasState) {
  const canvasContext = formatCanvasForPrompt(canvasState);
  
  return `${canvasContext}

## User Message
"${userMessage}"

## Your Task
Extract structured information from the user's message. Analyze what stage(s) this message relates to and what updates should be made.

## Stage Names (in order)
1. idea - What do you want to build?
2. user - Who is the primary user?
3. workflow - How does their current process look?
4. pain_point - Which part is the most difficult?
5. root_cause - Why does this problem happen?
6. assumption - What do you assume is true but haven't proven?
7. evidence - What evidence supports this assumption?
8. opportunity - What opportunity arises from this problem?
9. decision - What decision do you want to make?
10. mvp - What minimum features must be present?

## Output Format (JSON only, no explanation)
Return ONLY valid JSON in this exact structure:

{
  "updates": {
    "stage_name": {
      "action": "add|replace|needs_review",
      "status": "not_started|partial|complete",
      "summary": "brief summary of the insight",
      "confidence": 0-100
    }
  },
  "impact": {
    "affected_stages": [
      {
        "stage": "stage_name",
        "reason": "user_changed|contradiction|dependency",
        "action": "needs_review"
      }
    ]
  },
  "missing_stages": ["stage_name"],
  "target_stage": "stage_name_for_next_question"
}

## Rules
1. Only include stages that have NEW information in "updates"
2. Set status to "partial" if information is incomplete
3. Set status to "complete" if information is sufficient
4. Confidence score based on evidence strength (0-100)
5. Detect impacts: if user changes, workflow/pain_point/opportunity need review
6. Detect impacts: if pain_point changes, root_cause/assumption/evidence need review
7. List missing stages that are critical for next steps
8. Select ONE target_stage for the next question (prioritize by order)
9. Do NOT invent information not present in the user's message
10. Return ONLY the JSON object, no markdown, no explanation

Extract now:`;
}

function formatCanvasForPrompt(canvasState) {
  if (!canvasState || !canvasState.stages) {
    return '## Current Canvas State\nEmpty canvas - no stages filled yet.';
  }

  const stagesSummary = canvasState.stages
    .map(stage => {
      const itemsCount = stage.items ? stage.items.length : 0;
      return `- ${stage.name}: ${stage.status} (${itemsCount} items)${stage.summary ? ` - "${stage.summary}"` : ''}`;
    })
    .join('\n');

  return `## Current Canvas State
${stagesSummary}`;
}

export default buildExtractionPrompt;

// Made with Bob
