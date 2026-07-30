// Prompt A: Information Extraction
// Docs §7.03: Extract structured JSON from user messages

export function buildExtractionPrompt(userMessage, canvasState) {
  const canvasContext = formatCanvasForPrompt(canvasState);

  return `${canvasContext}

## User Message
"${userMessage}"

## Task
Extract structured JSON from the user message. Return ONLY valid JSON. No explanation.

## Example Output
{
  "updates": {
    "user": {
      "action": "add",
      "status": "complete",
      "summary": "Elementary school teachers",
      "confidence": 85,
      "items": {
        "confirmed": [{"content": "Teachers record student data manually", "evidence_type": "observational", "confidence_boost": 15}],
        "needs_validation": [],
        "next_steps": []
      }
    }
  },
  "impact": {"affected_stages": []},
  "missing_stages": ["workflow"],
  "target_stage": "workflow",
  "off_topic": false,
  "redirect_message": ""
}

## JSON Format
{
  "updates": {
    "stage_name": {
      "action": "add|replace|needs_review",
      "status": "not_started|partial|complete",
      "summary": "string",
      "confidence": 0-100,
      "items": {
        "confirmed": [{"content": "string", "evidence_type": "explicit|observational|experiential|assumption", "confidence_boost": 5|10|15|20}],
        "needs_validation": ["string"],
        "next_steps": ["string"]
      }
    }
  },
  "impact": {"affected_stages": [{"stage": "string", "reason": "user_changed|contradiction|dependency", "action": "needs_review"}]},
  "missing_stages": ["string"],
  "target_stage": "string",
  "off_topic": false,
  "redirect_message": ""
}

## Rules
1. Only add stages that have NEW info. Set confidence 0-100.
2. Use evidence_type: explicit=20, observational=15, experiential=10, assumption=5
3. If message is off-topic, set off_topic:true and provide redirect_message
4. Do NOT invent info. Return JSON only. No markdown. No explanation.

Extract now:`;
}

function formatCanvasForPrompt(canvasState) {
  if (!canvasState || !canvasState.stages) {
    return '## Current Canvas State\nEmpty canvas.';
  }

  const stagesSummary = canvasState.stages
    .map(stage => {
      const itemsCount = stage.items ? stage.items.length : 0;
      return `- ${stage.name}: ${stage.status} (${itemsCount} items)${stage.summary ? ` - "${stage.summary}"` : ''}`;
    })
    .join('\n');

  return `## Current Canvas State\n${stagesSummary}`;
}

export default buildExtractionPrompt;

// Made with Bob