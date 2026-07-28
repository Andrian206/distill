# 07 — AI Design

## 1. Architecture

Single LLM (Gemini). Dua prompt berurutan per turn. Tidak ada agent, tidak ada orchestration.

```
User Message
    │
    ▼
┌─────────────────┐
│  Prompt A       │  → Gemini → Structured JSON (canvas updates)
│  Extraction     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Merge + Impact │  → Canvas state updated
│  Detection      │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Prompt B       │  → Gemini → Natural response
│  Conversation   │
└─────────────────┘
    │
    ▼
Response to user
```

---

## 2. System Prompt (Persona)

```
You are a Thinking Partner — not a teacher, interviewer, or consultant.

Rules:
- Ask more than you answer.
- Challenge assumptions gently.
- Never judge the user. Critique ideas, not people.
- Do not praise excessively. Do not agree blindly.
- Guide with one focused question per turn.
- Do not invent facts. Use "partial" or "needs_validation" if unsure.
- Keep responses concise (2-3 sentences + 1 question).
```

---

## 3. Prompt A — Information Extraction

**Input:**
- Current canvas state (JSON)
- User message (text)

**Task:**
Extract structured information. Return only JSON. No chat.

**Output Schema:**

```json
{
  "updates": {
    "stage_name": {
      "action": "add|replace|needs_review",
      "status": "not_started|partial|complete",
      "summary": "string",
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
```

**Stage names:** idea, user, workflow, pain_point, root_cause, assumption, evidence, opportunity, decision, mvp

**Example:**

```json
{
  "updates": {
    "idea": {
      "action": "replace",
      "status": "complete",
      "summary": "Student record app for teachers",
      "confidence": 90
    },
    "user": {
      "action": "replace",
      "status": "complete",
      "summary": "Elementary school teachers",
      "confidence": 85
    }
  },
  "impact": {
    "affected_stages": []
  },
  "missing_stages": ["workflow"],
  "target_stage": "workflow"
}
```

---

## 4. Prompt B — Conversation Response

**Input:**
- Current canvas state (JSON)
- Target stage (from Prompt A)
- User message (text)

**Task:**
Generate natural chat response. Acknowledge user input. Ask one best question for the target stage.

**Constraints:**
- Max 3 sentences.
- 1 question only.
- Match Thinking Partner persona.
- Do not mention "stage" or internal logic to user.

**Example Output:**

```
Got it — teachers are your main users. To understand the problem better,
could you walk me through how they currently record student data?
What tools do they use today?
```

---

## 5. Stage-Based Reasoning Flow

```
Turn N:
  1. Receive user message + current canvas
  2. Call Prompt A → get structured updates
  3. Backend merges updates into SQLite
  4. Backend detects impact → mark affected stages
  5. Backend identifies missing stages
  6. Call Prompt B → get natural response
  7. Return {aiMessage, canvasUpdates} to frontend
```

**Key:** All reasoning happens in one LLM call sequence per turn. No stateful agent memory. Canvas is the single source of truth.

---

## 6. Impact Detection Rules

| Change | Affected Stages | Action |
|--------|----------------|--------|
| User changed | Workflow, Pain Point, Opportunity | needs_review |
| Pain Point changed | Root Cause, Assumption, Evidence | needs_review |
| Assumption invalidated | Evidence, Decision, MVP | needs_review |
| Decision changed | MVP | needs_review |

Backend applies these rules after Prompt A. AI only flags; backend executes.

---

## 7. Distillation Prompt

Triggered when all 10 stages are `complete`.

**Task:**
Review all stage summaries. Merge duplicates. Identify contradictions. Generate one core insight per stage with confidence.

**Output Schema:**

```json
{
  "distilled": {
    "stage_name": {
      "summary": "core insight",
      "confidence": 0-100
    }
  },
  "contradictions": [
    {
      "stages": ["a", "b"],
      "issue": "description"
    }
  ]
}
```

---

## 8. Blueprint Compilation Prompt

Triggered after distillation approved by user.

**Task:**
Compile 11-section blueprint from distilled canvas. Add reasoning summary.

**Output:** JSON matching blueprint schema (see 05-database-design.md Section 5.2).

---

## 9. Error Handling

| Case | Behavior |
|------|----------|
| Gemini returns invalid JSON | Retry once. If fail, return chat response without canvas update. |
| Gemini hallucinates data | Validate against user message. Reject if not found in chat history. |
| Gemini is too verbose | Truncate or re-prompt with "be concise" instruction. |
| API timeout (>10s) | Return error. Frontend shows retry button. |

---

## 10. Token Efficiency

- Canvas state sent as compact JSON (not full chat history).
- Only last 5 messages included in prompt context.
- System prompt cached where possible.
- No RAG, no embedding search for MVP.
