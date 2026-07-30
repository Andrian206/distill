# 07 — AI Design

## 1. Architecture

Single LLM (Gemini). Multi-engine reasoning with dynamic prompt composition. No agents, no orchestration — sequential prompt pipeline per turn.

```
User Message
    │
    ▼
┌─────────────────┐      ┌──────────────────┐
│  Context Save   │      │  Save User Msg   │
│  + Compression  │      │  to SQLite       │
└─────────────────┘      └──────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Prompt A: Information          │
│  Extraction (extract.js)        │
│  → Gemini → Structured JSON     │
│  (canvas updates, impact,       │
│  target_stage)                  │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Merge Updates into Canvas      │
│  (canvasService.js)             │
│  + Apply Impact Detection       │
│  (mark affected stages)         │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Contradiction Detection        │
│  (contradictionEngine.js)       │
│  → Identify conflicts,          │
│    flag affected stages         │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Mode Engine (modeEngine.js)    │
│  + Target Stage Lock            │
│  (selectNextStageWithLock)      │
│  → Determine conversation mode  │
│    (clarifying, reflection, etc)│
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Prompt B: Conversation         │
│  Response (composed via         │
│  promptComposer.js + converse/  │
│  reflect.js)                    │
│  → Gemini → Natural response    │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Save AI Message +              │
│  Calculate Confidence           │
│  (confidenceEngine.js)          │
└─────────────────────────────────┘
    │
    ▼
Response to user + updated canvas
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

## 5. Engine Pipeline (Per Turn)

### 5.1 Context Compression (Context Management)

**Trigger:** Every 50 non-system messages.

**Process:**
- Summarizes last 50 messages using `summarize.js` prompt
- Saves summary as system message with metadata
- Reduces context window while preserving key insights
- Frontend receives compact context: `[latest_summary] + [last 50 messages]`

**Location:** `server/routes/chat.js` (lines 58-98)

---

### 5.2 Information Extraction (Prompt A)

**Input:**
- Current canvas state (JSON)
- User message (text)
- Context messages (summary + recent history)

**Process:**
- Calls `extract.js` prompt via Gemini API
- Returns structured JSON: `updates`, `impact`, `missing_stages`, `target_stage`

**Output Schema:**
```json
{
  "updates": { "stage_name": { "action": "add|replace|needs_review", "status": "...", "summary": "...", "items": {...} } },
  "impact": { "affected_stages": [...] },
  "missing_stages": ["stage_name"],
  "target_stage": "stage_name"
}
```

**Handler:** `server/services/aiService.js` → `extractInformation()`

---

### 5.3 Canvas Merge & Impact Detection

**Process:**
1. Merge updates into SQLite (`canvasService.js: mergeCanvasUpdates`)
2. Detect impact on other stages (`canvasService.js: detectImpact`)
3. Apply impact → mark affected stages as `needs_review` (`canvasService.js: applyImpact`)
4. Recalculate confidence for updated stages (`confidenceEngine.js: calculateStageConfidence`)

**Impact Rules:**
| Change | Affected Stages |
|--------|----------------|
| User changed | Workflow, Pain Point, Opportunity |
| Pain Point changed | Root Cause, Assumption, Evidence |
| Assumption invalidated | Evidence, Decision, MVP |
| Decision changed | MVP |

---

### 5.4 Contradiction Detection

**Process:**
- Checks each updated stage against existing stage data
- Identifies logical inconsistencies (e.g., User = "Teacher" but Opportunity = "Parent app")
- Flags contradictions with conflict details
- Marks affected stages for review

**Handler:** `server/services/contradictionEngine.js`

---

### 5.5 Mode Engine & Target Stage Selection

**Process:**
1. Select target stage with Stage Lock mechanism (`selectNextStageWithLock`)
   - Locked stages (complete + confidence >= 80%) are skipped
   - Priority: needs_review → not_started → partial → complete-low-confidence
2. Select conversation mode based on context:
   - **listening:** User is explaining (long message)
   - **clarifying:** Low confidence, need more info
   - **challenging:** Contradiction detected
   - **confirming:** High confidence, near completion
   - **transition:** Stage complete, moving to next
   - **reflection:** Every 5 messages OR stagnation detected

**Handler:** `server/services/modeEngine.js`

---

### 5.6 Conversation Response (Prompt B)

**Input:**
- Current canvas state (JSON)
- Target stage
- Conversation mode + mode instructions
- User message
- Context messages

**Process:**
- Dynamic prompt composition via `promptComposer.js`
- Builds reasoning state, conversation memory, current objective
- Calls either `converse.js` or `reflect.js` prompt via Gemini
- Returns natural language response (2-3 sentences + 1 question)

**Handler:** `server/services/aiService.js` → `generateResponse()`

---

### 5.7 Confidence & Progress Tracking

**Confidence Calculation:**
```
Formula: (evidence*0.3 + consistency*0.3 + completeness*0.2 + evidenceType*0.2) * 100
```

**Progress Detection:**
- Compares previous canvas state with current
- Identifies newly completed stages
- Updates progress metrics

**Handlers:** `confidenceEngine.js`, `progressEngine.js`

---

### Complete Turn Flow

```
Turn N:
  1. Receive user message
  2. Context compression (if needed)
  3. Save user message to SQLite
  4. Prompt A: Extract information
  5. Merge updates + detect impact + apply impact
  6. Contradiction detection
  7. Mode engine + target stage selection
  8. Prompt B: Generate natural response
  9. Save AI message + calculate confidence
  10. Return {message, canvas, canvas_updates, impact, mode, target_stage, confidence}
```

---

## 6. Impact Detection Rules

| Change | Affected Stages | Action |
|--------|----------------|--------|
| User changed | Workflow, Pain Point, Opportunity | needs_review |
| Pain Point changed | Root Cause, Assumption, Evidence | needs_review |
| Assumption invalidated | Evidence, Decision, MVP | needs_review |
| Decision changed | MVP | needs_review |

**Implementation:** Backend applies these rules after Prompt A returns updates. The AI only identifies changes; the backend executes the impact logic.

**Location:** `server/services/canvasService.js: detectImpact()` + `applyImpact()`

---

## 7. Contradiction Engine

**Purpose:** Detect logical inconsistencies between stages.

**Types of Contradictions:**
- **User mismatch:** "Primary user is teachers" but "Main feature for parents"
- **Workflow conflict:** "Users are non-technical" but "Requires CLI command"
- **Opportunity mismatch:** "Pain point is X" but "Opportunity solves Y"

**Process:**
1. After canvas update, scan all stage data
2. Identify conflicting statements across stages
3. Flag contradictions with severity and affected stages
4. Mark stages as `needs_review` if contradiction found

**Output:**
```json
{
  "contradictions": [
    {
      "stages": ["user", "opportunity"],
      "issue": "User is teachers but opportunity targets parents",
      "severity": "high"
    }
  ]
}
```

**Handler:** `server/services/contradictionEngine.js`

---

## 8. Stage Lock Mechanism

**Purpose:** Prevent redundant questioning on well-established stages.

**Lock Criteria:**
- Stage status = `complete`
- Confidence >= 80

**Behavior:**
- Locked stages are skipped by the Mode Engine
- Only revisited if user explicitly changes them (sets to `needs_review`)
- Unlocked when confidence drops below threshold

**Handler:** `server/services/canvasService.js: selectNextStageWithLock()`

---

## 9. Distillation & Blueprint Compilation

### 9.1 Distillation

**Trigger:** All 10 stages are `complete` and no `needs_review` stages remain.

**Task:**
- Review all stage summaries
- Merge duplicate insights
- Identify remaining contradictions
- Generate one core insight per stage with confidence score

**Prompt:** `server/prompts/distill.js`

**Output Schema:**
```json
{
  "distilled": {
    "stage_name": {
      "summary": "core insight",
      "confidence": 0-100
    }
  },
  "contradictions": [...]
}
```

**Handler:** `server/services/aiService.js` → `distillCanvas()`

---

### 9.2 Blueprint Compilation

**Trigger:** User approves distillation results.

**Task:**
- Compile 11-section blueprint from distilled canvas
- Add reasoning summary
- Calculate overall confidence

**Prompt:** `server/prompts/blueprint.js`

**Output:** JSON matching blueprint schema (see 08-api-design.md Blueprint response).

**Handler:** `server/services/aiService.js` → `compileBlueprintWithAI()` with JS fallback in `blueprintService.js`

---

## 10. Error Handling

| Case | Behavior |
|------|----------|
| Gemini returns invalid JSON | Retry once. If fail, return chat response without canvas update. |
| Gemini hallucinates data | Validate against user message. Reject if not found in chat history. |
| Gemini is too verbose | Truncate or re-prompt with "be concise" instruction. |
| API timeout (>10s) | Return error. Frontend shows retry button. |
| Extraction fails | Fallback to clarifying question, no canvas update |
| All stages locked | Return null → trigger distillation flow |

---

## 11. Session Memory Management

### 11.1 Context Compression Strategy

**Problem:** Long conversations exceed context window.

**Solution:** Summarization every 50 messages.

**Implementation:**
- Maintains running summary of conversation
- Summary includes: key insights, decisions made, current stage status
- New context = `[system_summary] + [last_50_messages]`
- Summaries stored as system messages in SQLite

**Location:** `server/routes/chat.js` (lines 58-98)

---

### 11.2 Prompt Composition Strategy

**Dynamic Prompt Assembly** (not single static prompt):

1. **System Instructions:** Core persona + mode-specific instructions
2. **Reasoning State:** Canvas snapshot with all stages
3. **Conversation Memory:** Recent messages + summary
4. **Current Objective:** Mode + target stage + goal
5. **User Input:** Current message

**Composition Handler:** `server/services/promptComposer.js`

**Benefits:**
- Reusable across modes (clarifying, reflection, etc.)
- Consistent context across all prompts
- Easier to maintain and extend
