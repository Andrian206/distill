# 02 — Solution Overview

## 1. Solution Statement

Distill is an **AI Creative Reasoning Companion** that guides first-time builders through structured discovery, transforming ambiguous ideas into validated Project Blueprints.

---

## 2. Solution Architecture (Conceptual)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INPUT LAYER                                 │
│                                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│   │  User Chat  │  │  User Chat  │  │  User Chat  │  ...            │
│   │  (Turn 1)   │  │  (Turn 2)   │  │  (Turn 3)   │                 │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│          └─────────────────┴─────────────────┘                      │
│                         │                                           │
│                         ▼                                           │
│   ┌─────────────────────────────────────────────┐                   │
│   │         REASONING ENGINE (Multi-Engine)     │                   │
│   │                                             │                   │
│   │   ┌─────────────┐    ┌─────────────────┐   │                    │
│   │   │  Prompt A   │───▶│  Information    │   │                   │
│   │   │  Extraction │    │  Extraction     │   │                    │
│   │   └─────────────┘    └────────┬────────┘   │                  │
│   │                                │            │                  │
│   │   ┌───────────────┐  ┌────────▼────────┐   │                  │
│   │   │  Reasoning    │◀─┤  Canvas Update  │   │                  │
│   │   │  Multi-Engine │  │  + Engine Calc  │   │                  │
│   │   └───────┬───────┘  └────────┬────────┘   │                  │
│   │           │                   │            │                  │
│   │   ┌───────▼───────┐  ┌────────▼────────┐   │                  │
│   │   │  Prompt B     │◀─┤  Dynamic Prompt │   │                  │
│   │   │  Conversation │  │  Composition    │   │                  │
│   │   └───────────────┘  └─────────────────┘   │                  │
│   └─────────────────────────────────────────────┘                  │
│                         │                                           │
│                         ▼                                           │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    OUTPUT LAYER                              │  │
│   │                                                             │  │
│   │   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │  │
│   │   │ Thinking     │  │ Chat         │  │ Project        │   │  │
│   │   │ Canvas       │  │ Response     │  │ Blueprint      │   │  │
│   │   │ (Visual)     │  │ (Natural)    │  │ (Final Output) │   │  │
│   │   └──────────────┘  └──────────────┘  └────────────────┘   │  │
│   └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

```

---

## 3. Core Mechanisms

### 3.1 Stage-Based Reasoning

Distill uses a **10-stage thinking flow** as its internal framework. Each stage represents a layer of understanding that must be built before moving on to the next.

```
💡 Idea ──────► What do you want to build?
   │
   ▼
👤 User ──────► Who is experiencing the problem?
   │
   ▼
🔄 Workflow ───► How does their current process look?
   │
   ▼
⚠ Pain Point ──► Which part is the most difficult/frustrating?
   │
   ▼
🌱 Root Cause ──► Why does this problem occur?
   │
   ▼
❓ Assumption ──► What do we assume to be true but haven't validated yet?
   │
   ▼
📄 Evidence ───► What evidence supports this?
   │
   ▼
✨ Opportunity ─► What opportunity emerges?
   │
   ▼
✅ Decision ────► What final decision is made?
   │
   ▼
🚀 MVP ─────────► What is a realistic MVP scope?

```

**Key Principle:** The user does not select the stage. The AI automatically determines the stage based on the content of the conversation. The user only needs to speak naturally.

### 3.2 Guided Thinking Workspace (Thinking Canvas)

The Thinking Canvas is a **visual representation of discovery progress** that is constantly updated by the AI based on the conversation.

**Canvas Characteristics:**

* **Not a graph, not a flowchart** — it is a card-based workspace
* **No manual input from user** — the AI populates it automatically
* **Real-time update** — every user message triggers a canvas update
* **Progress visualization** — the user always knows "how far" they have progressed

**Canvas Structure:**

```
┌──────────────────────────────────────────────┐
│           THINKING CANVAS                    │
│                                              │
│  💡 Idea           [🟢 Complete]             │
│  👤 User           [🟢 Complete]             │
│  🔄 Workflow       [🟡 In Progress]          │
│  ⚠ Pain Point      [⚪ Not Started]         │
│  🌱 Root Cause     [⚪ Not Started]          │
│  ❓ Assumption     [⚪ Not Started]          │
│  📄 Evidence       [⚪ Not Started]          │
│  ✨ Opportunity    [⚪ Not Started]          │
│  ✅ Decision        [⚪ Not Started]         │
│  🚀 MVP            [⚪ Not Started]          │
│                                              │
└──────────────────────────────────────────────┘

```

### 3.3 Distillation Engine

At the core of Distill is the ability to gradually **reduce complexity**.

**Distillation Process:**

```
Phase 1: Collection
  ├─ Gather all ideas, pain points, assumptions
  └─ Without filtering, without judgment

Phase 2: Clustering
  ├─ Group similar items together
  └─ Identify duplications

Phase 3: Validation
  ├─ Flag weak assumptions
  └─ Prioritize items backed by evidence

Phase 4: Convergence
  ├─ Select the most valid direction
  └─ Discard irrelevant options

Phase 5: Synthesis
  ├─ Summarize into a single insight
  └─ Increase confidence score

```

**Example of Distillation on Pain Points:**

```
Input (User):
  • Duplicate Writing
  • Manual Archive
  • Repeated Recording
  • Duplicate Input

Output (Distill):
  ┌─────────────────────────────────┐
  │  Core Pain Point                │
  │                                 │
  │  Repetitive Administrative Work │
  │                                 │
  │  Confidence: High               │
  │  Evidence: 3 sources            │
  └─────────────────────────────────┘

```

### 3.4 Impact Detection & Consistency Engine

When a user changes a single decision, the AI automatically detects its impact on other stages.

**Example:**

```
User: "The primary user is not teachers, but parents."

AI Response:
  ┌──────────────────────────────────────────────┐
  │  Impact Detected                             │
  │                                              │
  │  👤 User → Updated: "Parent"                 │
  │  🔄 Workflow → Needs Review ⚠               │
  │  ⚠ Pain Point → Needs Review ⚠             │
  │  ✨ Opportunity → Needs Review ⚠            │
  │                                              │
  │  "Let's review the parents' workflow         │
  │   to ensure the pain point is still          │
  │   relevant."                                 │
  └──────────────────────────────────────────────┘

```

### 3.5 Confidence Scoring

Each insight on the canvas features a transparent **confidence score**:

* **High** — Supported by strong evidence, consistent
* **Medium** — Supported by some evidence, but still needs validation
* **Low** — Based on assumptions, requires investigation
* **Needs Validation** — No data available yet

The AI does not feign certainty. Confidence stems from sound reasoning, not from the AI model itself.

---

## 4. User Journey (Solution Flow)

### 4.1 Starting a Session

```
User opens Distill
       │
       ▼
┌─────────────────────────────┐
│  Empty Canvas displayed     │
│  with per-stage guidance    │
└─────────────────────────────┘
       │
       ▼
User: "I want to build an app
      for teachers because they have to
      record student data repeatedly."
       │
       ▼
┌─────────────────────────────┐
│  AI recognizes:             │
│  ✓ Idea: Student Record App │
│  ✓ User: Teacher            │
│  ✓ Pain Point: Repetitive   │
│    data recording           │
│                             │
│  AI updates canvas          │
│  AI asks about the          │
│  incomplete Workflow        │
└─────────────────────────────┘

```

### 4.2 During Discovery

```
Every conversation turn:
       │
       ▼
┌─────────────────────────────┐
│  1. Information Extraction  │
│     (extract.js)            │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  2. Reasoning Multi-Engine  │
│     (Confidence, Mode, etc) │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  3. Dynamic Prompt Compose  │
│     (promptComposer.js)     │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  4. Chat Response           │
│     (converse.js / reflect) │
└─────────────────────────────┘

```

### 4.3 Completing Discovery

```
All stages complete
       │
       ▼
┌─────────────────────────────┐
│  Final Distillation         │
│  • Merge duplicate insights │
│  • Resolve contradictions   │
│  • Finalize confidence      │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Project Blueprint          │
│  Generated                  │
└─────────────────────────────┘
       │
       ▼
User can proceed to
planning & development

```

---

## 5. Solution Differentiation

### 5.1 Distill vs ChatGPT

| Dimension | ChatGPT | Distill |
| --- | --- | --- |
| **Nature** | Conversational AI | Reasoning Workspace |
| **Output** | More text, more ideas | Less but validated |
| **Structure** | Free-form chat | Guided thinking flow |
| **Progress** | None | Visual canvas |
| **Consistency** | No cross-check | Impact detection |
| **Goal** | Answer questions | Help user decide |
| **End State** | Conversation ends | Project Blueprint |

### 5.2 Distill vs Notion/Confluence

| Dimension | Notion | Distill |
| --- | --- | --- |
| **Nature** | Documentation | Discovery |
| **Input** | User writes everything | AI extracts from chat |
| **Guidance** | Templates only | AI-guided questioning |
| **Validation** | None | Evidence & confidence |
| **Outcome** | Static document | Dynamic blueprint |

### 5.3 Distill vs Miro/FigJam

| Dimension | Miro | Distill |
| --- | --- | --- |
| **Nature** | Whiteboard | Thinking companion |
| **Input** | Manual sticky notes | AI auto-populated |
| **Reasoning** | None | Stage-based logic |
| **Consistency** | Manual check | Auto impact detection |

### 5.4 Distill vs Business Model Canvas

| Dimension | Lean Canvas | Distill |
| --- | --- | --- |
| **Nature** | Static framework | Dynamic AI companion |
| **Filling** | Manual | Auto from conversation |
| **Validation** | Self-assessment | AI evidence check |
| **Outcome** | Filled canvas | Validated blueprint |

---

## 6. Key Features (Product Level)

### 6.1 AI Conversation (Thinking Partner)

* Natural language chat
* Personality: non-judgmental, doesn't always agree, challenges assumptions
* Criticizes ideas, not the user
* Asks one single best question per turn to maintain focus

### 6.2 Thinking Canvas (Guided Workspace)

* 10 stage-based cards
* 3 states per card: Not Started, In Progress, Completed
* Structure per card: Summary → Confirmed → Need Validation → Next Step
* Auto-populated by AI; cannot be manually edited
* Real-time updates with every turn

### 6.3 Dynamic Stage Navigation

* AI determines the active stage based on the conversation
* Can populate multiple stages within a single user message
* Auto-detects missing stages and generates questions

### 6.4 Impact Detection

* Detects the impact of changes on other stages
* Flags stages that require review
* Maintains consistency across stages

### 6.5 Distillation Engine

* Merges similar insights
* Removes duplicates
* Prioritizes based on evidence
* Generates core insights with confidence scores

### 6.6 Project Blueprint Generator

* Compiles all stages into a single document
* Format: Project, Problem, User, Workflow, Pain Point, Root Cause, Evidence, Opportunity, Decision, MVP, Next Validation
* Ready for handoff to development

---

## 7. Value Proposition

### 7.1 For First-Time Builders

| Before Distill | After Distill |
| --- | --- |
| Vague, unstructured ideas | Clear ideas backed by a framework |
| Don't know the actual problem | Validated problem statement |
| Too many solutions | Single most valid direction |
| Assumptions treated as facts | Assumptions identified & validated |
| No progress tracking | Real-time visual progress |
| Fear of choosing a direction | Evidence-based confidence |
| Never reaching the MVP | Project Blueprint in < 30 minutes |

### 7.2 For Hackathon Participants

| Before Distill | After Distill |
| --- | --- |
| 2 hours of directionless brainstorming | 15 minutes of structured discovery |
| Pitch deck lacking a clear problem | Valid problem statement |
| Long feature list without priorities | Realistic MVP scope |
| Judges asking "what is the problem?" | Answers ready with evidence |

### 7.3 For Capstone Students

| Before Distill | After Distill |
| --- | --- |
| Changing topics repeatedly | Single validated direction |
| Vague Chapter 1 report | Clear problem statement |
| Advisors asking "who is the user?" | User persona ready |

---

## 8. Success Scenarios

### Scenario 1: Hackathon Participant

```
User: "I want to build an app for teachers..."

15 minutes later:
  ✓ Problem: Repetitive administrative work
  ✓ User: Elementary school teachers
  ✓ MVP: Digital attendance + grade input
  ✓ Confidence: 82%

Result: User immediately starts coding with a clear direction.

```

### Scenario 2: Capstone Student

```
User: "I'm confused about what to build for my final project..."

25 minutes later:
  ✓ Problem: Students struggle to find study groups
  ✓ User: University students in remote learning
  ✓ MVP: Peer-matching platform with subject filter
  ✓ Next Validation: Interview 5 students

Result: Student has a clear direction for their proposal.

```

### Scenario 3: Junior Founder

```
User: "I have many ideas but don't know which one to pursue first..."

30 minutes later:
  ✓ 3 ideas evaluated
  ✓ 1 idea selected with clear reasoning
  ✓ MVP scope defined
  ✓ Validation plan ready

Result: Founder has the confidence to commit to one idea.

```

---

## 9. Non-Solution Boundary

To maintain focus, Distill explicitly **DOES NOT** address:

| Not Distill's Task | Reason |
| --- | --- |
| Generating new business ideas | Focuses on narrowing down, not expanding |
| Writing complete business plans | Ends at the blueprint; does not handle business planning |
| Software architecture | Outside the scope of discovery |
| Sprint planning | Outside the scope of discovery |
| Coding / deployment | Outside the scope of discovery |
| Project management | Outside the scope of discovery |
| Team collaboration | Outside the scope of the MVP |
| User authentication | Outside the scope of the MVP |

---

## 10. Conclusion

Distill solves the discovery bottleneck through three primary mechanisms:

1. **Stage-Based Reasoning** — A structured thinking framework guided by AI
2. **Thinking Canvas** — A real-time, auto-populated visualization of discovery progress
3. **Distillation Engine** — A process that reduces complexity until only the most valid insights remain

The end output is a **Project Blueprint** — a handoff document that empowers first-time builders to move confidently from ambiguity to action.

> **Distill transforms ambiguous ideas into validated project directions through structured reasoning, visual thinking, and AI-assisted decision making.**