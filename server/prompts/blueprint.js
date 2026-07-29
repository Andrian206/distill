/**
 * Blueprint Compilation Prompt
 * Compiles 11-section blueprint from distilled canvas
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

    return `# BLUEPRINT COMPILATION TASK

You are compiling a Project Blueprint from a distilled discovery canvas.

## PROJECT INFORMATION
Project Name: ${project.name}
Status: ${project.status}

## DISTILLED CANVAS

${Object.entries(stages).map(([name, data]) => `
### ${name.toUpperCase()}
Summary: ${data.summary}
Confidence: ${data.confidence}%
Confirmed Items: ${data.items.filter(i => i.type === 'confirmed').length}
Needs Validation: ${data.items.filter(i => i.type === 'needs_validation').length}
`).join('\n')}

## YOUR TASK

Compile the 11-section Project Blueprint. Use ONLY information from the canvas above.

## OUTPUT FORMAT

Return ONLY valid JSON in this exact format:

\`\`\`json
{
  "project_name": "${project.name}",
  "problem_statement": "Clear statement of the problem (from pain_point)",
  "primary_user": "Who is the main user (from user)",
  "workflow": "Current workflow description (from workflow)",
  "core_pain_point": "The main pain point (from pain_point)",
  "root_cause": "Why the problem exists (from root_cause)",
  "key_evidence": [
    "Evidence item 1 (from evidence confirmed items)",
    "Evidence item 2"
  ],
  "opportunity": "The opportunity identified (from opportunity)",
  "decision": "The decision made (from decision)",
  "mvp_scope": [
    "MVP feature 1 (from mvp confirmed items)",
    "MVP feature 2"
  ],
  "next_validation": [
    "Validation step 1 (from assumption/evidence needs_validation)",
    "Validation step 2"
  ],
  "reasoning_summary": "Brief summary of the reasoning process (2-3 sentences)",
  "confidence_overall": 85
}
\`\`\`

IMPORTANT RULES:
1. Use ONLY information from the canvas - do NOT invent new content
2. If a section has no data, use a placeholder like "Not yet defined"
3. key_evidence, mvp_scope, and next_validation must be arrays
4. reasoning_summary should explain the logical flow from problem to solution
5. confidence_overall should be the average of all stage confidences
6. Keep all text concise and actionable
7. Ensure all JSON is valid and properly formatted
`;
}

// Made with Bob
