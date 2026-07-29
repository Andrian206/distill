/**
 * Distillation Prompt
 * Reviews all stage summaries, merges duplicates, identifies contradictions
 */

export default function buildDistillationPrompt(canvas) {
    const stageData = canvas.stages.map(stage => ({
        name: stage.name,
        summary: stage.summary || 'Not yet defined',
        confidence: stage.confidence || 0,
        items: stage.items || [],
    }));

    return `# DISTILLATION TASK

You are reviewing a completed discovery canvas with 10 stages. Your task is to:
1. Distill each stage into ONE core insight
2. Identify any contradictions between stages
3. Assign confidence scores (0-100)

## CANVAS DATA

${stageData.map(stage => `
### ${stage.name.toUpperCase()}
Summary: ${stage.summary}
Current Confidence: ${stage.confidence}%
Items: ${stage.items.length} items
`).join('\n')}

## YOUR TASK

Review all stages and provide:

1. **Distilled Insights**: One core insight per stage (max 2 sentences)
2. **Contradictions**: Any logical inconsistencies between stages
3. **Confidence Scores**: Based on clarity and evidence

## OUTPUT FORMAT

Return ONLY valid JSON in this exact format:

\`\`\`json
{
  "distilled": {
    "idea": {
      "summary": "Core insight about the idea",
      "confidence": 85
    },
    "user": {
      "summary": "Core insight about the user",
      "confidence": 90
    },
    "workflow": {
      "summary": "Core insight about workflow",
      "confidence": 80
    },
    "pain_point": {
      "summary": "Core insight about pain point",
      "confidence": 85
    },
    "root_cause": {
      "summary": "Core insight about root cause",
      "confidence": 75
    },
    "assumption": {
      "summary": "Core insight about assumptions",
      "confidence": 70
    },
    "evidence": {
      "summary": "Core insight about evidence",
      "confidence": 80
    },
    "opportunity": {
      "summary": "Core insight about opportunity",
      "confidence": 85
    },
    "decision": {
      "summary": "Core insight about decision",
      "confidence": 90
    },
    "mvp": {
      "summary": "Core insight about MVP",
      "confidence": 85
    }
  },
  "contradictions": [
    {
      "stages": ["stage_a", "stage_b"],
      "issue": "Description of the contradiction"
    }
  ]
}
\`\`\`

IMPORTANT:
- Each summary must be 1-2 sentences maximum
- Confidence must be 0-100
- Only include contradictions if they actually exist (can be empty array)
- Do NOT invent information not present in the canvas
- Focus on merging similar points, not adding new ones
`;
}

// Made with Bob
