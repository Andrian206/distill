/**
 * Blueprint Compilation Prompt
 * Docs §7.08: Compiles 11-section blueprint from distilled canvas
 */
export default function buildBlueprintPrompt(project, distilledCanvas) {
    const stages = distilledCanvas.stages.reduce((acc, stage) => {
        acc[stage.name] = {
            summary: stage.summary || 'Not defined',
            confidence: stage.confidence || 0,
            items: stage.items || [],
        };
        return acc;
    }, {});

    return `# BLUEPRINT COMPILATION

Project: ${project.name}

## Canvas Data
${Object.entries(stages).map(([name, data]) => `
### ${name.toUpperCase()}
Summary: ${data.summary}
Confidence: ${data.confidence}%
Confirmed Items: ${data.items.filter(i => i.type === 'confirmed').length}`).join('')}

## Task
Compile 11-section Project Blueprint using ONLY canvas data above.

## Output (JSON only)
{
  "project_name": "${project.name}",
  "problem_statement": "from pain_point",
  "primary_user": "from user",
  "workflow": "from workflow",
  "core_pain_point": "from pain_point",
  "root_cause": "from root_cause",
  "key_evidence": ["from evidence"],
  "opportunity": "from opportunity",
  "decision": "from decision",
  "mvp_scope": ["from mvp"],
  "next_validation": ["from assumption/evidence"],
  "reasoning_summary": "2-3 sentences",
  "confidence_overall": 85
}

Rules:
1. Use ONLY canvas data, do not invent
2. If no data, use "Not yet defined"
3. Keep text concise and actionable

Generate now:`;
}

// Made with Bob