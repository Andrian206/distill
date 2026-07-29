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
      "items": {
        "confirmed": [
          {
            "content": "fact or observation",
            "evidence_type": "explicit|observational|experiential|assumption",
            "confidence_boost": 5-20
          }
        ],
        "needs_validation": ["assumption 1", "assumption 2"],
        "next_steps": ["action 1", "action 2"]
      }
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
  "target_stage": "stage_name_for_next_question",
  "off_topic": false,
  "redirect_message": ""
}

## Evidence Classification Rules

For each confirmed item, classify evidence type and assign confidence boost:

**Explicit Evidence** (confidence_boost: 20)
- Statistics, numbers, percentages
- KPIs, metrics, measurements
- Survey results, research data
- Official reports, documents
- Quantifiable facts
Example: "50% of teachers spend 2 hours daily on data entry"

**Observational Evidence** (confidence_boost: 15)
- Direct field observations
- Witnessed behaviors or patterns
- Results from interviews or discussions
- Community feedback
- Documented experiences
Example: "I observed teachers manually copying data from notebooks to Excel"

**Experiential Evidence** (confidence_boost: 10)
- Personal experience
- Daily work activities
- Routine processes
- First-hand knowledge
- Professional background
Example: "As a teacher for 10 years, I do this every day"

**Assumption** (confidence_boost: 5)
- Hypotheses not yet validated
- Predictions or guesses
- Beliefs without evidence
- Unverified claims
Example: "I think most teachers would prefer mobile apps"

## Rules
1. Only include stages that have NEW information in "updates"
2. Set status to "partial" if information is incomplete
3. Set status to "complete" if information is sufficient (confidence >= 80%)
4. **Evidence classification is MANDATORY** for all confirmed items
5. **Items categorization**:
   - "confirmed": Facts with evidence_type and confidence_boost
   - "needs_validation": Assumptions or hypotheses (strings only)
   - "next_steps": Actions or validations needed (strings only)
6. Detect impacts: if user changes, workflow/pain_point/opportunity need review
7. Detect impacts: if pain_point changes, root_cause/assumption/evidence need review
8. List missing stages that are critical for next steps
9. Select ONE target_stage for the next question (prioritize by order)
10. Do NOT invent information not present in the user's message
11. Return ONLY the JSON object, no markdown, no explanation
12. **Off-topic detection**: If the user's message is completely unrelated to the project, set "off_topic" to true and provide a "redirect_message"
13. **Off-topic indicator**: If the message asks for code, business plans, or unrelated advice, treat it as off-topic
14. **Always populate items**: Every stage update MUST include items object with at least one category filled
15. **Evidence type is required**: Every confirmed item MUST have evidence_type and confidence_boost

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
