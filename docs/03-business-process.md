# 03 — Business Process

## 1. Business Process Overview

This document describes the business process flow of Distill from an operational perspective — how users interact with the system, how the AI processes information, and how outputs are generated. The focus is on **"what happens"** and **"who performs it"**, rather than technical implementation details.

---

## 2. Actor Definitions

| Actor | Role | Responsibilities |
| --- | --- | --- |
| **User** | First-time Builder | Initiates projects, engages in discussions with AI, validates insights, makes final decisions |
| **AI Thinking Partner** | Reasoning Engine | Extracts information, updates the canvas, detects impacts, generates questions, performs distillation |
| **System** | Distill Platform | Stores states, manages progress, generates blueprints, renders the UI |

---

## 3. High-Level Business Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DISTILL BUSINESS PROCESS                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   START     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────────────────┐
    │  BP-01: Initialize      │
    │  Project                │
    │  (User + System)        │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │  BP-02: Discovery       │
    │  Session                │
    │  (User + AI + System)   │
    │  [Iterative Loop]       │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐      No
    │  BP-03: Check           │─────────────────► (Back to BP-02)
    │  Completion?            │
    └───────────┬─────────────┘
                │ Yes
                ▼
    ┌─────────────────────────┐
    │  BP-04: Distillation    │
    │  & Validation           │
    │  (AI + System)          │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐      No
    │  BP-05: User            │─────────────────► (Back to BP-02)
    │  Validates?             │
    └───────────┬─────────────┘
                │ Yes
                ▼
    ┌─────────────────────────┐
    │  BP-06: Generate        │
    │  Project Blueprint      │
    │  (AI + System)          │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │  BP-07: Handoff         │
    │  & Closure              │
    │  (User + System)        │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────┐
    │    END      │
    └─────────────┘

```

---

## 4. Detailed Business Process

### BP-01: Initialize Project

**Trigger:** User opens Distill and decides to start a new discovery session.

**Pre-conditions:**

* The Distill application is running
* User has access to the platform

**Process Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User selects "New Project" or "Start Discovery"    │
│         (Actor: User)                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: System creates a new project with a unique ID      │
│         and initializes an empty canvas                     │
│         (Actor: System)                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: System displays an Empty Canvas with per-stage     │
│         guidance:                                           │
│         • "What do you want to build?"                      │
│         • "Who is the primary user?"                        │
│         • "How does their current process look?"            │
│         (Actor: System)                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: AI greets the user and asks an opening question    │
│         to initiate discovery                               │
│         (Actor: AI)                                         │
└─────────────────────────────────────────────────────────────┘

Post-conditions:
  ✓ Project created with an empty canvas
  ✓ User ready to start the discovery conversation
  ✓ "Idea" stage becomes the active focus

```

**Business Rules:**

* BR-01: Every project must have a unique ID
* BR-02: The canvas must be initialized with 10 stages in "Not Started" status
* BR-03: The AI must not immediately provide solutions in the opening phase
* BR-04: Opening questions must be open-ended and non-confusing

---

### BP-02: Discovery Session (Core Loop)

**Trigger:** User sends a message in the chat.

**Pre-conditions:**

* Project is already initialized
* Canvas holds current state
* AI understands the active stage

**Process Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User types a message in the chat panel             │
│         (Actor: User)                                       │
│                                                             │
│         Example: "I want to build an app for teachers       │
│         because they have to record student data            │
│         repeatedly."                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: AI receives the message and performs Information   │
│         Extraction — identifying information contained      │
│         within the user message                             │
│         (Actor: AI)                                         │
│                                                             │
│         Extraction results:                                 │
│         • Idea: Student Record System                       │
│         • User: Teacher                                     │
│         • Pain Point: Repetitive data recording             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: AI performs Canvas Update — updating identified    │
│         stages with new values                              │
│         (Actor: AI)                                         │
│                                                             │
│         Updates:                                            │
│         • Idea → Complete                                   │
│         • User → Complete                                   │
│         • Pain Point → Partial                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: AI performs Impact Detection — checking whether    │
│         new information affects other stages                │
│         (Actor: AI)                                         │
│                                                             │
│         Detection results:                                  │
│         • Workflow → Needs Review (due to user change)      │
│         • (No contradictions detected)                      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4b: Contradiction Detection — identifying logical     │
│         inconsistencies between stages                     │
│         (Actor: AI)                                         │
│                                                             │
│         Example:                                            │
│         • User = "Teacher" but Opportunity = "Parent app"   │
│         → Both stages marked as Needs Review                │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: System updates the canvas display in real-time     │
│         based on AI updates                                 │
│         (Actor: System)                                     │
│                                                             │
│         Visual update:                                      │
│         • Idea [🟢]                                         │
│         • User [🟢]                                         │
│         • Workflow [🟡]  ← active focus                     │
│         • Pain Point [🟡]                                   │
│         • Root Cause [⚪]                                    │
│         • ...                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: AI performs Missing Stage Detection — determining  │
│         which stage most needs to be filled next            │
│         (Actor: AI)                                         │
│                                                             │
│         Detection results:                                  │
│         • Workflow = Missing (highest priority)             │
│         • Pain Point = Partial (second priority)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 7: AI generates Chat Response — answering the user   │
│         and posing a single best question for the missing   │
│         stage                                               │
│         (Actor: AI)                                         │
│                                                             │
│         Response:                                           │
│         "Interesting! So the primary target is teachers.    │
│          Could you share how student data recording works    │
│          currently? Do they use notebooks, spreadsheets,    │
│          or other applications?"                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 8: User reads response and views canvas updates       │
│         (Actor: User)                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │  Decision: User wants to continue?  │
         │                                     │
         │  [Yes] ────────► (Loop to Step 1)   │
         │  [No] ─────────► (End Session)      │
         └─────────────────────────────────────┘

```

**Business Rules:**

* BR-05: Every user message must be processed in the following order: Extract → Update → Impact → Contradiction → Detect → Respond
* BR-06: AI may only ask **one primary question** per turn to maintain focus
* BR-07: The canvas must be updated before the chat response is displayed
* BR-08: Impact detection must be performed for every stage update
* BR-09: Contradiction detection must be performed after impact detection
* BR-10: Users cannot manually edit the canvas — all changes occur through chat
* BR-11: If a user modifies a stage that was previously complete, that stage changes to "Needs Review"

---

### BP-03: Check Completion

**Trigger:** After every conversation turn or upon user request.

**Pre-conditions:**

* Canvas holds current state
* At least a few stages are filled

**Process Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: System evaluates the status of all 10 stages       │
│         (Actor: System)                                     │
│                                                             │
│         Complete Criteria:                                  │
│         • Stage has a clear summary                         │
│         • Stage has at least 1 "Confirmed" item             │
│         • Stage does not have a "Needs Review" status       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │  Decision: Are all stages complete? │
         │                                     │
         │  [No] ─────────► (Continue BP-02)   │
         │  [Yes] ────────► (Proceed to BP-04) │
         └─────────────────────────────────────┘

```

**Business Rules:**

* BR-11: All 10 stages must have a "Complete" status before distillation can begin
* BR-12: Stages with a "Needs Review" status are not considered Complete
* BR-13: Users can request a "Check Progress" at any time

---

### BP-04: Distillation & Validation

**Trigger:** All 10 stages achieve Complete status.

**Pre-conditions:**

* All stages are Complete
* No stages are in "Needs Review" status

**Process Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: AI performs Cross-Stage Consistency Check          │
│         — ensuring no contradictions exist across stages    │
│         (Actor: AI)                                         │
│                                                             │
│         Example contradiction:                              │
│         • User = "Teacher" but Workflow = "Parent signup"   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │  Decision: Contradictions exist?    │
         │                                     │
         │  [Yes] ────────► (Mark related      │
         │                 stages as Needs     │
         │                 Review, return to   │
         │                 BP-02)              │
         │  [No] ─────────► (Proceed to Step 2)│
         └─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: AI performs Distillation per stage                 │
│         — simplifying insights into core insights           │
│         (Actor: AI)                                         │
│                                                             │
│         Example:                                            │
│         Input: 4 pain points                                │
│         Output: 1 core pain point + confidence score        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: AI calculates Confidence Score for each            │
│         distilled insight                                   │
│         (Actor: AI)                                         │
│                                                             │
│         Categories:                                         │
│         • High (80-100%): Strong evidence, consistent       │
│         • Medium (50-79%): Some evidence, needs validation  │
│         • Low (0-49%): Based on assumptions                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: System displays the Distilled Canvas to the user   │
│         for validation                                      │
│         (Actor: System)                                     │
└─────────────────────────────────────────────────────────────┘

```

**Business Rules:**

* BR-14: Distillation is performed only after all stages are complete
* BR-15: Contradictions must be resolved prior to distillation
* BR-16: Every distilled insight must carry a confidence score
* BR-17: AI must not fabricate new data during distillation

---

### BP-05: User Validation

**Trigger:** Distilled Canvas is displayed to the user.

**Pre-conditions:**

* Distillation process completed
* Distilled Canvas is ready for review

**Process Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User reviews the Distilled Canvas and Blueprint    │
│         preview                                             │
│         (Actor: User)                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │  Decision: User approves?           │
         │                                     │
         │  [Approve] ────► (Proceed to BP-06) │
         │                                     │
         │  [Needs Revision] ─► (Identify      │
         │                     stages to fix,  │
         │                     return to BP-02)│
         └─────────────────────────────────────┘

```

**Business Rules:**

* BR-18: Final decisions always remain with the user (AI Guides, Not Replaces)
* BR-19: User may request revisions on specific stages
* BR-20: If the user disagrees, AI must ask "which part requires adjustment"

---

### BP-06: Generate Project Blueprint

**Trigger:** User approves distillation results.

**Pre-conditions:**

* User has validated the distilled canvas
* No stages require revision

**Process Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: AI compiles all distilled insights into the        │
│         Project Blueprint structure                         │
│         (Actor: AI)                                         │
│                                                             │
│         Blueprint Structure:                                │
│         1. Project Name                                     │
│         2. Problem Statement                                │
│         3. Primary User                                     │
│         4. Workflow                                         │
│         5. Core Pain Point                                  │
│         6. Root Cause                                       │
│         7. Key Evidence                                     │
│         8. Opportunity                                      │
│         9. Decision                                         │
│         10. MVP Scope                                       │
│         11. Next Validation Steps                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: AI adds a Reasoning Summary — a brief explanation │
│         of why these decisions were reached                 │
│         (Actor: AI)                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: System saves the Project Blueprint and renders     │
│         it to the user in a clean format                    │
│         (Actor: System)                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: AI provides a closing message empowering user      │
│         confidence to begin building                        │
│         (Actor: AI)                                         │
│                                                             │
│         "You now have a clear direction. The problem        │
│          is validated, MVP scope is defined, and you        │
│          know your next validation steps. Happy building!" │
└─────────────────────────────────────────────────────────────┘

```

**Business Rules:**

* BR-21: The Blueprint must include all 11 components
* BR-22: The Blueprint must be clear and ready for project handoff
* BR-23: The Blueprint must contain a reasoning summary
* BR-24: The Blueprint must not contain information absent from the canvas

---

### BP-07: Handoff & Closure

**Trigger:** Project Blueprint has been generated.

**Pre-conditions:**

* Blueprint is available
* User has viewed the blueprint

**Process Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User can view, copy, or utilize the Project        │
│         Blueprint for the next phase                        │
│         (Actor: User)                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: System stores project history and final canvas     │
│         for future reference                                │
│         (Actor: System)                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: User decides to:                                   │
│         • Begin development based on the blueprint          │
│         • Save the blueprint for later                      │
│         • Start a new project                               │
│         (Actor: User)                                       │
└─────────────────────────────────────────────────────────────┘

```

**Business Rules:**

* BR-25: The Blueprint must remain accessible to the user after the session ends
* BR-26: Project history must be persisted (even if MVP lacks auth)
* BR-27: Users can start a new project without deleting previous ones

---

## 5. State Machine: Project Lifecycle

```
                         ┌─────────────┐
                         │   CREATED   │
                         │(New project)│
                         └──────┬──────┘
                                │ User sends first message
                                ▼
                         ┌─────────────┐
                         │ DISCOVERING │
                         │   (Active   │
                         │   session)  │
                         └──────┬──────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │  STAGE_UPDATE │  │  NEEDS_REVIEW │  │  USER_PAUSED  │
    │(Canvas changes│  │ (User changes │  │ (User pauses  │
    │   occur)      │  │   decision)   │  │   session)    │
    └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │ ALL_COMPLETE  │  │  BACK_TO_     │  │  RESUME_      │
    │ (All stages   │  │  DISCOVERING  │  │  DISCOVERING  │
    │   complete)   │  │               │  │               │
    └───────┬───────┘  └───────────────┘  └───────────────┘
            │
            ▼
    ┌───────────────┐
    │ DISTILLING    │
    │ (Distillation │
    │   process)    │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  VALIDATING   │
    │  (Awaiting    │
    │    user)      │
    └───────┬───────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌─────────┐  ┌──────────┐
│APPROVED │  │ REVISION │
│         │  │ REQUESTED│
└────┬────┘  └────┬─────┘
     │            │
     ▼            ▼
┌─────────┐  ┌──────────┐
│GENERATE │  │BACK_TO_  │
│BLUEPRINT│  │DISCOVERING│
└────┬────┘  └──────────┘
     │
     ▼
┌─────────┐
│COMPLETED│
│(Blueprint│
│  ready) │
└─────────┘

```

---

## 6. Decision Matrix

| Decision Point | Condition | Action |
| --- | --- | --- |
| DP-01 | User starts a new project | Initialize empty canvas, AI poses opening question |
| DP-02 | User sends a message | Extract → Update → Impact → Contradiction → Respond |
| DP-03 | Stage changes from Complete | Mark "Needs Review", detect impact on other stages |
| DP-04 | All stages Complete | Trigger distillation process |
| DP-05 | Contradiction detected | Mark affected stages, pose clarifying question |
| DP-06 | Distillation finished | Display to user for validation |
| DP-07 | User approves | Generate blueprint |
| DP-08 | User requests revision | Identify stage, return to discovery |
| DP-09 | Blueprint generated | Display final output, close session |

---

## 7. Exception Handling

| Exception | Condition | Handling |
| --- | --- | --- |
| EX-01 | User sends off-topic message | AI gently redirects back to discovery topic |
| EX-02 | User requests coding/architecture | AI explains project scope, redirects to discovery |
| EX-03 | User completely changes idea mid-way | AI updates canvas, marks all stages as "Needs Review" |
| EX-04 | AI fails to extract information | AI asks for clarification via specific questions |
| EX-05 | User wants to skip a stage | AI explains stage importance, reiterates question |
| EX-06 | User requests blueprint before completion | AI highlights remaining incomplete stages |
| EX-07 | Contradiction cannot be resolved | AI marks stage as "Unresolved", proceeds with disclaimer |

---

## 8. Process Metrics (Business Level)

| Metric | Definition | Target | Calculated By |
| --- | --- | --- | --- |
| Session Duration | Time from start to blueprint generation | < 30 minutes | System |
| Stage Completion Rate | % of stages completed per session | > 90% | System |
| Distillation Quality | % of users approving without revision | > 70% | System |
| User Confidence Score | Self-reported after blueprint generation | > 8/10 | User |
| Conversation Turns | Number of chat turns per session | 15-25 | System |
| Impact Detection Accuracy | % of detected changes that actually impact other stages | > 85% | AI |
| Return Rate | % of users starting a new project | > 50% | System |

---

## 9. Business Rules Summary

| ID | Business Rule |
| --- | --- |
| BR-01 | Every project must have a unique ID |
| BR-02 | Canvas initialized with 10 "Not Started" stages |
| BR-03 | AI must not immediately provide answers in the opening stage |
| BR-04 | Opening question must be open-ended and non-confusing |
| BR-05 | Every message processed: Extract → Update → Impact → Detect → Respond |
| BR-06 | AI may ask only one primary question per turn |
| BR-07 | Canvas updated before chat response is displayed |
| BR-08 | Impact detection performed for every stage update |
| BR-09 | User cannot manually edit canvas — all changes via chat |
| BR-10 | Stage modified from Complete changes to "Needs Review" |
| BR-11 | All 10 stages must be Complete prior to distillation |
| BR-12 | "Needs Review" stages are not considered Complete |
| BR-13 | User can request "Check Progress" at any time |
| BR-14 | Distillation occurs only after all stages are Complete |
| BR-15 | Contradictions must be resolved prior to distillation |
| BR-16 | Every distilled insight carries a confidence score |
| BR-17 | AI must not fabricate data during distillation |
| BR-18 | Final decisions remain with the user |
| BR-19 | User can request revisions on specific stages |
| BR-20 | If user disagrees, AI asks which part requires adjustment |
| BR-21 | Blueprint must contain all 11 components |
| BR-22 | Blueprint must be clear and ready for handoff |
| BR-23 | Blueprint must include a reasoning summary |
| BR-24 | Blueprint must not include information absent from canvas |
| BR-25 | Blueprint remains available to user post-session |
| BR-26 | Project history must be saved |
| BR-27 | User can start new projects without deleting old ones |

---

## 10. Conclusion

The Distill business process revolves around structured **discovery iteration**:

1. **Initialize** — Project created, canvas empty, AI greets user
2. **Discover** — Core loop: User chat → AI extract → Canvas update → Impact detect → Question generate → AI respond
3. **Complete Check** — System evaluates whether all stages are sufficient
4. **Distill** — AI simplifies insights and calculates confidence
5. **Validate** — User reviews and approves (or requests revision)
6. **Generate** — Project Blueprint is compiled and presented
7. **Handoff** — User utilizes the blueprint for the next phase

This process ensures that every Distill session yields **validated decisions** and an **execution-ready document**, rather than merely a long, directionless conversation.