--- START OF FILE Paste July 28, 2026 - 10:21PM ---

# 04 — Functional Requirement

## 1. Scope

This document defines all the functional requirements of the Distill system — what the system must do, by whom, and with what acceptance criteria. This document **does not** discuss database design, technical architecture, sequence diagrams, or API specifications (which are available in separate documents).

---

## 2. Functional Decomposition

The Distill system consists of 7 main functional modules:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISTILL FUNCTIONAL MODULES                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  FR-MOD-01  │  │  FR-MOD-02  │  │     FR-MOD-03       │   │
│  │  Project    │  │  Chat &     │  │  Thinking Canvas    │   │
│  │  Management │  │  Conversation│  │  Visualization      │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  FR-MOD-04  │  │  FR-MOD-05  │  │     FR-MOD-06       │   │
│  │  Detail     │  │  AI Reasoning│  │  Blueprint          │   │
│  │  Panel      │  │  Engine     │  │  Generator          │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│                                                                  │
│              ┌─────────────────────────────┐                    │
│              │        FR-MOD-07            │                    │
│              │   Canvas State Management   │                    │
│              └─────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Module: FR-MOD-01 — Project Management

### Overview
This module manages the lifecycle of Distill projects — creation, storage, deletion, and navigation between projects.

### Functional Requirements

#### FR-01-001: Create New Project
| Attribute | Value |
|-----------|-------|
| **ID** | FR-01-001 |
| **Module** | Project Management |
| **Priority** | Must Have |
| **Actor** | User |
| **Description** | The system must allow the user to create a new discovery project |
| **Pre-condition** | Distill application is active |
| **Trigger** | User selects the "New Project" or "Start Discovery" option |
| **Input** | Project name (optional, default: "Untitled Project") |
| **Process** | 1. System generates a unique project ID<br>2. System initializes the canvas with 10 stages in "not_started" status<br>3. System sets the created_at timestamp<br>4. System displays an empty canvas with per-stage guidance<br>5. AI generates a greeting message and opening question |
| **Output** | New project with an empty canvas, chat panel displays the AI greeting |
| **Post-condition** | Project is saved in storage, user is ready to start discovery |

**Acceptance Criteria:**
- [ ] Unique project ID is automatically generated
- [ ] 10 stages are initialized with "not_started" status
- [ ] Empty canvas displays descriptive guidance per stage
- [ ] AI greeting appears in the chat panel
- [ ] Project can be accessed again after being created

---

#### FR-01-002: List Projects
| Attribute | Value |
|-----------|-------|
| **ID** | FR-01-002 |
| **Module** | Project Management |
| **Priority** | Must Have |
| **Actor** | User |
| **Description** | The system must display a list of projects previously created by the user |
| **Pre-condition** | At least one project has been created |
| **Trigger** | User opens the project list page |
| **Input** | — |
| **Process** | 1. System retrieves the list of projects from storage<br>2. System displays projects with: name, date created, latest status, concise progress |
| **Output** | List of projects in list/card format |
| **Post-condition** | User can select a project to continue |

**Acceptance Criteria:**
- [ ] List of projects is sorted by most recent modification time
- [ ] Each item displays the name, date, and progress status
- [ ] User can select a project to resume a session
- [ ] User can delete a project from the list

---

#### FR-01-003: Delete Project
| Attribute | Value |
|-----------|-------|
| **ID** | FR-01-003 |
| **Module** | Project Management |
| **Priority** | Should Have |
| **Actor** | User |
| **Description** | The system must allow the user to delete a project |
| **Pre-condition** | Project exists in storage |
| **Trigger** | User selects the delete option on a project |
| **Input** | Project ID |
| **Process** | 1. System displays a deletion confirmation<br>2. If confirmed by the user, the system deletes the project and all related data from storage |
| **Output** | Project is deleted, project list is updated |
| **Post-condition** | Project can no longer be accessed |

**Acceptance Criteria:**
- [ ] Deletion confirmation is displayed before execution
- [ ] Once deleted, the project no longer appears in the list
- [ ] Related data (canvas, chat history) is also deleted

---

#### FR-01-004: Resume Project
| Attribute | Value |
|-----------|-------|
| **ID** | FR-01-004 |
| **Module** | Project Management |
| **Priority** | Must Have |
| **Actor** | User |
| **Description** | The system must allow the user to resume an existing project |
| **Pre-condition** | Project exists with saved state |
| **Trigger** | User selects a project from the list |
| **Input** | Project ID |
| **Process** | 1. System retrieves project data (canvas state, chat history)<br>2. System restores canvas to the last state<br>3. System restores chat history to the chat panel<br>4. System displays the workspace in an active state |
| **Output** | Workspace with canvas and chat already containing previous data |
| **Post-condition** | User can continue discovery from the last point |

**Acceptance Criteria:**
- [ ] Canvas state is restored accurately
- [ ] Chat history is displayed in chronological order
- [ ] Detail panel displays the last selected card (if any)
- [ ] User can directly continue chatting without losing context

---

## 4. Module: FR-MOD-02 — Chat & Conversation

### Overview
This module handles conversational interactions between the user and the AI Thinking Partner.

### Functional Requirements

#### FR-02-001: Send User Message
| Attribute | Value |
|-----------|-------|
| **ID** | FR-02-001 |
| **Module** | Chat & Conversation |
| **Priority** | Must Have |
| **Actor** | User |
| **Description** | The system must allow the user to send text messages to the AI |
| **Pre-condition** | Active project, chat panel is available |
| **Trigger** | User types a message and presses enter/clicks send |
| **Input** | Message text (string, maximum 2000 characters) |
| **Process** | 1. System displays the user message in the chat panel<br>2. System sends the message to the AI Reasoning Engine<br>3. System displays an "AI is thinking..." indicator |
| **Output** | User message is displayed in the chat panel |
| **Post-condition** | User message is recorded, AI is processing |

**Acceptance Criteria:**
- [ ] User message is displayed in real-time within the chat panel
- [ ] Input field is cleared after the message is sent
- [ ] Processing indicator is displayed while the AI processes
- [ ] Message is saved in the chat history

---

#### FR-02-002: Receive AI Response
| Attribute | Value |
|-----------|-------|
| **ID** | FR-02-002 |
| **Module** | Chat & Conversation |
| **Priority** | Must Have |
| **Actor** | AI Reasoning Engine |
| **Description** | The system must display the AI response in the chat panel after processing is complete |
| **Pre-condition** | AI has completed the reasoning pipeline |
| **Trigger** | AI Reasoning Engine returns a response |
| **Input** | Response from AI (natural text + structured data for canvas update) |
| **Process** | 1. System hides the processing indicator<br>2. System displays the AI response in the chat panel<br>3. System updates the canvas based on structured data<br>4. System updates the detail panel if the active card changes<br>5. System saves the response to the chat history |
| **Output** | AI response is displayed, canvas is updated, detail panel is updated |
| **Post-condition** | User can read the response and view canvas progress |

**Acceptance Criteria:**
- [ ] AI response appears in the chat panel after processing is complete
- [ ] Canvas updates automatically based on structured data
- [ ] Detail panel updates if the currently active card changes
- [ ] Response is saved in the chat history
- [ ] Chat automatically scrolls to the latest message

---

#### FR-02-003: Display Chat History
| Attribute | Value |
|-----------|-------|
| **ID** | FR-02-003 |
| **Module** | Chat & Conversation |
| **Priority** | Must Have |
| **Actor** | User, System |
| **Description** | The system must display conversation history in chronological order |
| **Pre-condition** | Project has chat history |
| **Trigger** | User opens a project or scrolls the chat panel |
| **Input** | — |
| **Process** | 1. System retrieves chat history from storage<br>2. System displays messages in chronological order<br>3. System visually distinguishes between user and AI messages |
| **Output** | Chat history inside the chat panel |
| **Post-condition** | User can view previous conversation context |

**Acceptance Criteria:**
- [ ] User and AI messages are visually distinguished (alignment, color, avatar)
- [ ] Chronological order is maintained
- [ ] Chat history is loaded when the project is resumed
- [ ] Automatic scroll to the latest message when a new message arrives

---

#### FR-02-004: Handle Off-Topic Input
| Attribute | Value |
|-----------|-------|
| **ID** | FR-02-004 |
| **Module** | Chat & Conversation |
| **Priority** | Should Have |
| **Actor** | User, AI |
| **Description** | The system must handle user inputs outside the discovery scope |
| **Pre-condition** | User sends an off-topic message |
| **Trigger** | AI detects the message is irrelevant to the discovery project |
| **Input** | User off-topic message |
| **Process** | 1. AI detects that the message is out of scope<br>2. AI generates a response that gently redirects back to the discovery topic<br>3. AI does not update the canvas for off-topic messages |
| **Output** | AI response guiding back to discovery |
| **Post-condition** | Conversation stays on the discovery track |

**Acceptance Criteria:**
- [ ] AI does not process off-topic messages as discovery data
- [ ] AI provides a polite response and redirects back
- [ ] Canvas is not updated by off-topic messages
- [ ] AI maintains its personality as a thinking partner

---

## 5. Module: FR-MOD-03 — Thinking Canvas Visualization

### Overview
This module handles the visual display of the Thinking Canvas — a card-based workspace representation of discovery progress.

### Functional Requirements

#### FR-03-001: Display Canvas Cards
| Attribute | Value |
|-----------|-------|
| **ID** | FR-03-001 |
| **Module** | Thinking Canvas |
| **Priority** | Must Have |
| **Actor** | System |
| **Description** | The system must display 10 canvas cards in a vertical layout |
| **Pre-condition** | Active project |
| **Trigger** | Project is loaded or canvas is updated |
| **Input** | Canvas state (10 stages with status and content) |
| **Process** | 1. System renders 10 cards in thinking flow order<br>2. Each card displays: icon, stage name, status indicator, brief summary |
| **Output** | Canvas panel with 10 cards |
| **Post-condition** | User can visually view discovery progress |

**Acceptance Criteria:**
- [ ] 10 cards are displayed in the order: Idea, User, Workflow, Pain Point, Root Cause, Assumption, Evidence, Opportunity, Decision, MVP
- [ ] Each card has a consistent icon
- [ ] Status indicator is clearly visible (color/icon)
- [ ] Brief summary is visible without needing expansion
- [ ] Layout is responsive and does not overlap

---

#### FR-03-002: Visual Stage States
| Attribute | Value |
|-----------|-------|
| **ID** | FR-03-002 |
| **Module** | Thinking Canvas |
| **Priority** | Must Have |
| **Actor** | System |
| **Description** | The system must display 3 visual states per card |
| **Pre-condition** | Canvas has stage states |
| **Trigger** | Stage state changes |
| **Input** | Stage status: not_started, in_progress, completed |
| **Process** | 1. System maps status to visual indicator<br>2. System updates card appearance according to status |
| **Output** | Card with corresponding visual state |

**State Visual Mapping:**

| Status | Visual | Display Description |
|--------|--------|---------------------|
| not_started | ⚪ Gray/Neutral | Thin card, only title and brief guidance |
| in_progress | 🟡 Yellow/Active | Expanded card, displays summary, active indicator |
| completed | 🟢 Green/Done | Compact card, displays result summary, checkmark |
| needs_review | 🔴 Red/Warning | Card with warning indicator, indicating review is needed |

**Acceptance Criteria:**
- [ ] Each status has a clear and consistent visual
- [ ] Transitions between statuses look smooth
- [ ] User can distinguish status at a glance
- [ ] Needs_review status has a special marker

---

#### FR-03-003: Auto-Update Canvas
| Attribute | Value |
|-----------|-------|
| **ID** | FR-03-003 |
| **Module** | Thinking Canvas |
| **Priority** | Must Have |
| **Actor** | System, AI Reasoning Engine |
| **Description** | The system must automatically update the canvas based on structured data from the AI |
| **Pre-condition** | AI returns structured updates |
| **Trigger** | Every time an AI response contains canvas updates |
| **Input** | Structured JSON: stage updates (status, summary, confirmed items, needs validation items, next steps) |
| **Process** | 1. System parses structured updates<br>2. System merges updates into existing canvas state<br>3. System re-renders affected cards<br>4. System highlights newly changed cards |
| **Output** | Canvas updates in real-time |
| **Post-condition** | User sees canvas changes without manual refresh |

**Acceptance Criteria:**
- [ ] Canvas updates within < 500ms after AI response
- [ ] Only changed cards are re-rendered (no full refresh)
- [ ] Newly changed cards have a highlight/brief animation
- [ ] Update occurs before the chat response finishes displaying

---

#### FR-03-004: Empty Canvas State
| Attribute | Value |
|-----------|-------|
| **ID** | FR-03-004 |
| **Module** | Thinking Canvas |
| **Priority** | Must Have |
| **Actor** | System |
| **Description** | The system must display guidance on an empty canvas when a new project is created |
| **Pre-condition** | New project is initialized |
| **Trigger** | Project creation |
| **Input** | — |
| **Process** | 1. System renders 10 cards with "not_started" status<br>2. Each card displays a guiding question |
| **Output** | Canvas with guiding questions |

**Guiding Questions per Stage:**

| Stage | Guiding Question |
|-------|------------------|
| Idea | What do you want to build? |
| User | Who is the primary user? |
| Workflow | How is their current process? |
| Pain Point | Which part is the most difficult? |
| Root Cause | Why does this problem happen? |
| Assumption | What do you assume is true but haven't proven? |
| Evidence | What evidence supports this assumption? |
| Opportunity | What opportunity arises from this problem? |
| Decision | What decision do you want to make? |
| MVP | What minimum features must be present? |

**Acceptance Criteria:**
- [ ] All 10 cards display relevant guiding questions
- [ ] Guiding questions help users understand the purpose of each stage
- [ ] Guiding questions disappear after a stage has content

---

#### FR-03-005: Card Selection
| Attribute | Value |
|-----------|-------|
| **ID** | FR-03-005 |
| **Module** | Thinking Canvas |
| **Priority** | Must Have |
| **Actor** | User |
| **Description** | The system must allow the user to select a card to view details |
| **Pre-condition** | Canvas is displayed |
| **Trigger** | User clicks a card |
| **Input** | Card ID / Stage name |
| **Process** | 1. System highlights the selected card<br>2. System displays card details in the right panel |
| **Output** | Selected card, detail panel updated |
| **Post-condition** | User can view details of the selected stage |

**Acceptance Criteria:**
- [ ] Selected card has a clear visual highlight
- [ ] Detail panel displays the corresponding card content
- [ ] Only one card can be selected at a time
- [ ] In_progress cards are automatically selected if there is no manual choice

---

## 6. Module: FR-MOD-04 — Detail Panel

### Overview
This module displays complete details of the currently selected card on the canvas.

### Functional Requirements

#### FR-04-001: Display Card Detail
| Attribute | Value |
|-----------|-------|
| **ID** | FR-04-001 |
| **Module** | Detail Panel |
| **Priority** | Must Have |
| **Actor** | System |
| **Description** | The system must display complete details of the selected card |
| **Pre-condition** | Card has been selected on the canvas |
| **Trigger** | Card selection event |
| **Input** | Card data: stage name, status, summary, confirmed[], needs_validation[], next_step |
| **Process** | 1. System renders detail panel with a 4-section structure<br>2. System displays status and confidence score |
| **Output** | Detail panel filled with card data |

**Detail Panel Structure:**

```
┌─────────────────────────────────────┐
│  [Icon] Stage Name                  │
│  Status: [Indicator]                │
│  Confidence: [Score]%               │
│                                     │
│  ── Summary ──────────────────────  │
│  [Insight summary]                  │
│                                     │
│  ── Confirmed ────────────────────  │
│  ✓ [Item 1]                         │
│  ✓ [Item 2]                         │
│                                     │
│  ── Needs Validation ─────────────  │
│  ? [Item 1]                         │
│  ? [Item 2]                         │
│                                     │
│  ── Next Step ────────────────    │
│  → [Next action]                    │
└─────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Detail panel displays all 4 sections (Summary, Confirmed, Needs Validation, Next Step)
- [ ] Status and confidence score are clearly visible
- [ ] "Confirmed" items have a visual checkmark
- [ ] "Needs Validation" items have a question mark/warning visual
- [ ] Panel updates in real-time when the card changes

---

#### FR-04-002: Confidence Score Display
| Attribute | Value |
|-----------|-------|
| **ID** | FR-04-002 |
| **Module** | Detail Panel |
| **Priority** | Should Have |
| **Actor** | System |
| **Description** | The system must display a confidence score per card |
| **Pre-condition** | Card has confidence data |
| **Trigger** | Card is selected or confidence changes |
| **Input** | Confidence score (0-100%) |
| **Process** | 1. System maps score to visual category<br>2. System displays score with color coding |
| **Output** | Confidence score with visual indicator |

**Confidence Mapping:**

| Score | Category | Visual |
|-------|----------|--------|
| 80-100% | High | 🟢 Green |
| 50-79% | Medium | 🟡 Yellow |
| 0-49% | Low | 🔴 Red |
| N/A | Needs Validation | ⚪ Gray |

**Acceptance Criteria:**
- [ ] Score is displayed as a percentage
- [ ] Color coding is consistent with categories
- [ ] Score updates when the canvas changes
- [ ] Tooltip/brief explanation is available

---

## 7. Module: FR-MOD-05 — AI Reasoning Engine

### Overview
This module defines the functional requirements of the AI engine that performs reasoning, extraction, and generation.

### Functional Requirements

#### FR-05-001: Information Extraction
| Attribute | Value |
|-----------|-------|
| **ID** | FR-05-001 |
| **Module** | AI Reasoning Engine |
| **Priority** | Must Have |
| **Actor** | AI |
| **Description** | The AI must extract relevant information from each user message |
| **Pre-condition** | User sends a message |
| **Trigger** | User message received |
| **Input** | User message + current canvas state |
| **Process** | 1. AI analyzes user message<br>2. AI identifies which stage is contained in the message<br>3. AI extracts values for that stage |
| **Output** | Structured extraction: stage → {status, value, confidence} |

**Acceptance Criteria:**
- [ ] AI can extract information for single or multiple stages in a single message
- [ ] AI does not invent information not present in the message
- [ ] AI marks status as "partial" if information is incomplete
- [ ] AI returns extraction results in structured format

---

#### FR-05-002: Canvas Update Generation
| Attribute | Value |
|-----------|-------|
| **ID** | FR-05-002 |
| **Module** | AI Reasoning Engine |
| **Priority** | Must Have |
| **Actor** | AI |
| **Description** | The AI must generate structured updates for the canvas based on extraction |
| **Pre-condition** | Information extraction complete |
| **Trigger** | Extraction results available |
| **Input** | Extracted information |
| **Process** | 1. AI formats extraction into canvas update structure<br>2. AI determines action per stage: add, replace, needs_review |
| **Output** | JSON updates: {stage: {action, value, status}} |

**Acceptance Criteria:**
- [ ] AI only returns stages that change (delta update)
- [ ] AI determines appropriate actions (add/replace/needs_review)
- [ ] Output format is consistent and parseable
- [ ] AI does not return unchanged stages

---

#### FR-05-003: Impact Detection
| Attribute | Value |
|-----------|-------|
| **ID** | FR-05-003 |
| **Module** | AI Reasoning Engine |
| **Priority** | Must Have |
| **Actor** | AI |
| **Description** | The AI must detect whether changes in one stage affect other stages |
| **Pre-condition** | Stage is updated |
| **Trigger** | After canvas update generation |
| **Input** | Updated stage + current canvas state |
| **Process** | 1. AI analyzes inter-stage relationships<br>2. AI identifies potentially impacted stages<br>3. AI marks impacted stages as "needs_review" |
| **Output** | Impact report: {affected_stages: [{stage, reason, action}]} |

**Acceptance Criteria:**
- [ ] AI detects impacts of user changes on other stages
- [ ] AI does not invent new data for impacted stages
- [ ] AI only marks as "needs_review", rather than filling new values
- [ ] Reason for impact is available for display

---

#### FR-05-004: Missing Stage Detection
| Attribute | Value |
|-----------|-------|
| **ID** | FR-05-004 |
| **Module** | AI Reasoning Engine |
| **Priority** | Must Have |
| **Actor** | AI |
| **Description** | The AI must determine which stage most needs to be filled next |
| **Pre-condition** | Canvas update and impact detection complete |
| **Trigger** | After impact detection |
| **Input** | Current canvas state |
| **Process** | 1. AI evaluates status of all stages<br>2. AI prioritizes stages that are "missing" or "partial"<br>3. AI selects the stage with the highest priority |
| **Output** | Target stage for the next question |

**Acceptance Criteria:**
- [ ] AI selects stages that are truly missing/partial
- [ ] AI follows thinking flow order (Idea → User → Workflow → ...)
- [ ] AI does not skip incomplete stages
- [ ] AI can handle multiple missing stages with proper prioritization

---

#### FR-05-005: Question Generation
| Attribute | Value |
|-----------|-------|
| **ID** | FR-05-005 |
| **Module** | AI Reasoning Engine |
| **Priority** | Must Have |
| **Actor** | AI |
| **Description** | The AI must generate a single best question for the missing stage |
| **Pre-condition** | Missing stage detected |
| **Trigger** | After missing stage detection |
| **Input** | Target stage + current canvas state |
| **Process** | 1. AI analyzes missing stage context<br>2. AI generates a specific and open-ended question<br>3. AI ensures the question is natural and questionnaire-like |
| **Output** | Natural language question |

**Acceptance Criteria:**
- [ ] AI asks a maximum of one primary question per turn
- [ ] Question is specific to the missing stage
- [ ] Question is in natural language, not like a form
- [ ] Question considers context of already filled stages
- [ ] AI still responds if the user does not directly answer the question

---

#### FR-05-006: Conversation Response Generation
| Attribute | Value |
|-----------|-------|
| **ID** | FR-05-006 |
| **Module** | AI Reasoning Engine |
| **Priority** | Must Have |
| **Actor** | AI |
| **Description** | The AI must generate a natural response acknowledging user input, providing feedback, and asking the next question |
| **Pre-condition** | All reasoning steps complete |
| **Trigger** | After question generation |
| **Input** | User message, canvas updates, impact report, target question |
| **Process** | 1. AI generates a response acknowledging user input<br>2. AI communicates canvas updates (if relevant)<br>3. AI naturally asks the next question |
| **Output** | Natural language chat response |

**Acceptance Criteria:**
- [ ] Response acknowledges and validates user input
- [ ] Response is not too long (maximum 3-4 paragraphs)
- [ ] Response contains one clear primary question
- [ ] Tone matches personality: non-judgmental, not overly praising, questioning assumptions
- [ ] Response does not reveal internal reasoning (users don't need to know "stage detection")

---

#### FR-05-007: Distillation Process
| Attribute | Value |
|-----------|-------|
| **ID** | FR-05-007 |
| **Module** | AI Reasoning Engine |
| **Priority** | Must Have |
| **Actor** | AI |
| **Description** | The AI must distill each stage after all stages are complete |
| **Pre-condition** | All 10 stages status complete |
| **Trigger** | User or system triggers distillation |
| **Input** | Complete canvas data |
| **Process** | 1. AI reviews all items per stage<br>2. AI identifies duplication and redundancy<br>3. AI merges similar items<br>4. AI generates core insight per stage<br>5. AI assigns confidence score |
| **Output** | Distilled canvas: core insight + confidence per stage |

**Acceptance Criteria:**
- [ ] Distillation reduces complexity without losing essence
- [ ] Duplications are identified and combined
- [ ] Core insights are clear and concise
- [ ] Confidence score available per stage
- [ ] AI does not invent new insights not present on the canvas

---

#### FR-05-008: Contradiction Detection
| Attribute | Value |
|-----------|-------|
| **ID** | FR-05-008 |
| **Module** | AI Reasoning Engine |
| **Priority** | Must Have |
| **Actor** | AI |
| **Description** | The AI must detect contradictions between stages during discovery |
| **Pre-condition** | At least 2 stages filled |
| **Trigger** | Every time canvas is updated |
| **Input** | Current canvas state |
| **Process** | 1. AI cross-checks between stages<br>2. AI identifies logical inconsistencies<br>3. AI marks conflicting stages as "needs_review" |
| **Output** | Contradiction report (if any) |

**Acceptance Criteria:**
- [ ] AI detects logical contradictions between stages
- [ ] AI creates no false positives (marking non-contradictions as contradictions)
- [ ] AI explains why a contradiction occurs
- [ ] AI suggests ways to resolve contradictions

---

## 8. Module: FR-MOD-06 — Blueprint Generator

### Overview
This module handles the generation and presentation of the Project Blueprint as the final output.

### Functional Requirements

#### FR-06-001: Trigger Blueprint Generation
| Attribute | Value |
|-----------|-------|
| **ID** | FR-06-001 |
| **Module** | Blueprint Generator |
| **Priority** | Must Have |
| **Actor** | User, System |
| **Description** | The system must allow the user to trigger blueprint generation after distillation is complete |
| **Pre-condition** | Distillation complete and user approved |
| **Trigger** | User selects "Generate Blueprint" or all stages complete + user validated |
| **Input** | Distilled canvas data |
| **Process** | 1. System compiles all stages into blueprint structure<br>2. AI generates reasoning summary<br>3. System formats output |
| **Output** | Project Blueprint document |

**Acceptance Criteria:**
- [ ] Blueprint can only be generated after distillation is complete
- [ ] User can trigger generation explicitly
- [ ] System displays blueprint preview before finalizing

---

#### FR-06-002: Blueprint Content Compilation
| Attribute | Value |
|-----------|-------|
| **ID** | FR-06-002 |
| **Module** | Blueprint Generator |
| **Priority** | Must Have |
| **Actor** | AI, System |
| **Description** | The system must compile 11 blueprint components from the distilled canvas |
| **Pre-condition** | Distilled canvas available |
| **Trigger** | Blueprint generation triggered |
| **Input** | Distilled canvas (10 stages) |
| **Process** | 1. Map each stage to blueprint components<br>2. Generate reasoning summary<br>3. Format in a neat structure |
| **Output** | Blueprint with 11 components |

**Blueprint Structure:**

| No | Component | Source Stage |
|----|-----------|--------------|
| 1 | Project Name | Idea + User input |
| 2 | Problem Statement | Pain Point (distilled) |
| 3 | Primary User | User (distilled) |
| 4 | Workflow | Workflow (distilled) |
| 5 | Core Pain Point | Pain Point (distilled) |
| 6 | Root Cause | Root Cause (distilled) |
| 7 | Key Evidence | Evidence (distilled) |
| 8 | Opportunity | Opportunity (distilled) |
| 9 | Decision | Decision (distilled) |
| 10 | MVP Scope | MVP (distilled) |
| 11 | Next Validation | Assumption + Evidence (needs_validation items) |

**Acceptance Criteria:**
- [ ] All 11 components available in the blueprint
- [ ] Each component contains distilled insights, not raw data
- [ ] Reasoning summary explains why decisions were made
- [ ] Blueprint contains no information not present on the canvas

---

#### FR-06-003: Blueprint Display
| Attribute | Value |
|-----------|-------|
| **ID** | FR-06-003 |
| **Module** | Blueprint Generator |
| **Priority** | Must Have |
| **Actor** | System |
| **Description** | The system must display the blueprint in a neat and readable format |
| **Pre-condition** | Blueprint has been generated |
| **Trigger** | Blueprint generation complete |
| **Input** | Blueprint data |
| **Process** | 1. System renders blueprint in a modal/dedicated panel<br>2. System distinguishes headings and content<br>3. System displays confidence score per section |
| **Output** | Blueprint display |

**Acceptance Criteria:**
- [ ] Blueprint is displayed in a neat and structured format
- [ ] User can scroll and read the entire blueprint
- [ ] Confidence score visible per section
- [ ] User can copy blueprint content (copy to clipboard)

---

#### FR-06-004: Blueprint Export
| Attribute | Value |
|-----------|-------|
| **ID** | FR-06-004 |
| **Module** | Blueprint Generator |
| **Priority** | Could Have |
| **Actor** | User, System |
| **Description** | The system must allow the user to export the blueprint |
| **Pre-condition** | Blueprint available |
| **Trigger** | User selects export option |
| **Input** | Blueprint data |
| **Process** | 1. System formats blueprint into requested format<br>2. System initiates download |
| **Output** | Downloaded file (JSON/Markdown/TXT) |

**Acceptance Criteria:**
- [ ] At least JSON and Markdown formats available
- [ ] File contains all blueprint components
- [ ] File name contains project name and timestamp

---

## 9. Module: FR-MOD-07 — Canvas State Management

### Overview
This module manages canvas state — stage status, changes, consistency, and persistence.

### Functional Requirements

#### FR-07-001: Stage Status Management
| Attribute | Value |
|-----------|-------|
| **ID** | FR-07-001 |
| **Module** | Canvas State Management |
| **Priority** | Must Have |
| **Actor** | System |
| **Description** | The system must accurately manage the status of each stage |
| **Pre-condition** | Active project |
| **Trigger** | Canvas update from AI |
| **Input** | Stage update: {stage, status, value} |
| **Process** | 1. System validates received status<br>2. System updates stage status<br>3. System triggers canvas re-render |
| **Output** | Updated stage status |

**Status Valid Values:**
- `not_started` — Stage has no content yet
- `partial` — Stage has content but is incomplete
- `complete` — Stage has sufficient content
- `needs_review` — Stage needs re-evaluation due to changes in another stage

**Acceptance Criteria:**
- [ ] Status can only change via AI updates (not manual edits)
- [ ] Valid status transition: not_started → partial → complete
- [ ] Complete status can revert to needs_review if impacted
- [ ] Needs_review status can revert to complete after review

---

#### FR-07-002: Canvas Persistence
| Attribute | Value |
|-----------|-------|
| **ID** | FR-07-002 |
| **Module** | Canvas State Management |
| **Priority** | Must Have |
| **Actor** | System |
| **Description** | The system must save canvas state after each update |
| **Pre-condition** | Canvas changes |
| **Trigger** | After canvas update is applied |
| **Input** | Current canvas state |
| **Process** | 1. System serializes canvas state<br>2. System saves to storage<br>3. System updates timestamp |
| **Output** | Saved canvas state |

**Acceptance Criteria:**
- [ ] Canvas state is saved after every update
- [ ] Data is not lost if the browser is refreshed
- [ ] Data can be restored when resuming a project
- [ ] Last_updated timestamp is recorded

---

#### FR-07-003: Consistency Maintenance
| Attribute | Value |
|-----------|-------|
| **ID** | FR-07-003 |
| **Module** | Canvas State Management |
| **Priority** | Must Have |
| **Actor** | System, AI |
| **Description** | The system must ensure consistency between stages |
| **Pre-condition** | Canvas has multiple stages |
| **Trigger** | Every canvas update |
| **Input** | Updated canvas state |
| **Process** | 1. System receives impact report from AI<br>2. System marks impacted stages as needs_review<br>3. System updates canvas visual |
| **Output** | Canvas with maintained consistency |

**Acceptance Criteria:**
- [ ] Impacted stages automatically become needs_review
- [ ] User can see which stages need re-evaluation
- [ ] Consistency is checked every time the canvas changes
- [ ] System does not change stage values without user input

---

#### FR-07-004: Progress Tracking
| Attribute | Value |
|-----------|-------|
| **ID** | FR-07-004 |
| **Module** | Canvas State Management |
| **Priority** | Should Have |
| **Actor** | System |
| **Description** | The system must display overall discovery progress |
| **Pre-condition** | Canvas has state |
| **Trigger** | Every time canvas changes or user requests progress |
| **Input** | Canvas state |
| **Process** | 1. System calculates number of complete stages / total stages<br>2. System displays progress indicator |
| **Output** | Progress percentage / progress bar |

**Acceptance Criteria:**
- [ ] Progress is displayed as a percentage
- [ ] Progress bar is clearly visible in the UI
- [ ] Progress updates in real-time
- [ ] 100% progress only if all stages are complete and there are no needs_review items

---

## 10. Data Requirements (Functional Level)

### 10.1 Input Data

| ID | Input | Source | Format | Validation |
|----|-------|--------|--------|------------|
| DI-01 | User message | User input | Text, max 2000 chars | Cannot be empty |
| DI-02 | Project name | User input | Text, max 100 chars | Optional, default "Untitled" |
| DI-03 | Card selection | User click | Stage ID | Must be a valid stage |
| DI-04 | Blueprint approval | User action | Boolean | — |
| DI-05 | Project deletion confirm | User action | Boolean | — |

### 10.2 Output Data

| ID | Output | Destination | Format |
|----|--------|-------------|--------|
| DO-01 | AI chat response | Chat panel | Natural text |
| DO-02 | Canvas updates | Canvas panel | Structured JSON |
| DO-03 | Card detail | Detail panel | Structured data |
| DO-04 | Project blueprint | Blueprint panel | Structured document |
| DO-05 | Progress indicator | Canvas/UI | Percentage/Bar |
| DO-06 | Project list | Project page | List/Card array |

### 10.3 Internal Data Flow

```
User Message
    ↓
[DI-01] ──► AI Reasoning Engine
                ↓
    ┌───────────┼───────────┐
    ▼           ▼           ▼
[DO-01]    [DO-02]     [DO-03]
Chat       Canvas      Detail
Response   Updates     Panel
    │           │           │
    └───────────┴───────────┘
                ↓
         Canvas State Store
                ↓
         [DO-04] Blueprint
```

---

## 11. Error Handling Requirements (Functional)

| ID | Error Condition | System Response |
|----|-----------------|-----------------|
| EH-01 | AI does not respond within a reasonable time | Display error message, give retry option |
| EH-02 | AI returns invalid structured data | Display chat response without canvas update, log error |
| EH-03 | Storage full or unable to save | Display warning, still allow chatting |
| EH-04 | Project data corrupt upon resume | Display error, give option to start new project |
| EH-05 | User sends very long message | Truncate or reject with a clear message |
| EH-06 | Browser refreshed during active session | Auto-restore last saved state |
| EH-07 | AI hallucination (inventing data) | Validate structured data, reject if no basis in chat history |

---

## 12. Summary: FR Priority Matrix

| ID | Requirement | Module | Priority | Status |
|----|-------------|--------|----------|--------|
| FR-01-001 | Create New Project | Project Mgmt | Must Have | ⏳ |
| FR-01-002 | List Projects | Project Mgmt | Must Have | ⏳ |
| FR-01-003 | Delete Project | Project Mgmt | Should Have | ⏳ |
| FR-01-004 | Resume Project | Project Mgmt | Must Have | ⏳ |
| FR-02-001 | Send User Message | Chat | Must Have | ⏳ |
| FR-02-002 | Receive AI Response | Chat | Must Have | ⏳ |
| FR-02-003 | Display Chat History | Chat | Must Have | ⏳ |
| FR-02-004 | Handle Off-Topic | Chat | Should Have | ⏳ |
| FR-03-001 | Display Canvas Cards | Canvas | Must Have | ⏳ |
| FR-03-002 | Visual Stage States | Canvas | Must Have | ⏳ |
| FR-03-003 | Auto-Update Canvas | Canvas | Must Have | ⏳ |
| FR-03-004 | Empty Canvas State | Canvas | Must Have | ⏳ |
| FR-03-005 | Card Selection | Canvas | Must Have | ⏳ |
| FR-04-001 | Display Card Detail | Detail | Must Have | ⏳ |
| FR-04-002 | Confidence Score | Detail | Should Have | ⏳ |
| FR-05-001 | Information Extraction | AI Engine | Must Have | ⏳ |
| FR-05-002 | Canvas Update Gen | AI Engine | Must Have | ⏳ |
| FR-05-003 | Impact Detection | AI Engine | Must Have | ⏳ |
| FR-05-004 | Missing Stage Detection | AI Engine | Must Have | ⏳ |
| FR-05-005 | Question Generation | AI Engine | Must Have | ⏳ |
| FR-05-006 | Conversation Response | AI Engine | Must Have | ⏳ |
| FR-05-007 | Distillation Process | AI Engine | Must Have | ⏳ |
| FR-05-008 | Contradiction Detection | AI Engine | Must Have | ⏳ |
| FR-06-001 | Trigger Blueprint | Blueprint | Must Have | ⏳ |
| FR-06-002 | Blueprint Compilation | Blueprint | Must Have | ⏳ |
| FR-06-003 | Blueprint Display | Blueprint | Must Have | ⏳ |
| FR-06-004 | Blueprint Export | Blueprint | Could Have | ⏳ |
| FR-07-001 | Stage Status Mgmt | State Mgmt | Must Have | ⏳ |
| FR-07-002 | Canvas Persistence | State Mgmt | Must Have | ⏳ |
| FR-07-003 | Consistency Maintenance | State Mgmt | Must Have | ⏳ |
| FR-07-004 | Progress Tracking | State Mgmt | Should Have | ⏳ |

**Priority Legend:**
- **Must Have** — Essential feature, MVP cannot function without it
- **Should Have** — Important feature, but MVP can still function without it
- **Could Have** — Nice-to-have feature, can be added post-MVP

---

## 13. Conclusion

This document defines **31 Functional Requirements** spread across 7 main modules. Each requirement is equipped with a clear description, actor, pre-condition, trigger, process, output, post-condition, and acceptance criteria.

**Guiding Principles:**
1. **Canvas is not manually edited** — all changes happen via chat
2. **AI reasoning is transparent** — impact detection and contradiction detection are always active
3. **User in control** — final decisions and validations are in the hands of the user
4. **Progress is visible** — users always know how far discovery has progressed
5. **Output is actionable** — blueprints are ready-to-use handoff documents