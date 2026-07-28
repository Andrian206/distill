# Distill

> **From Ambiguity to Action.**

**Distill** is an **AI Creative Reasoning Companion** that helps first-time builders transform ambiguous ideas into validated project directions through a structured discovery process.

Unlike chatbots or AI idea generators, Distill does not focus on generating more ideas. Instead, it helps users understand, validate, and commit to a single project direction worth building.

---

## Table of Contents

- [Vision & Mission](#vision--mission)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Core Mechanisms](#core-mechanisms)
- [Product Output](#product-output)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Roadmap](#development-roadmap)
- [Documentation](#documentation)

---

## Vision & Mission

**Vision:** Helping people think before they build.

**Mission:** Provide an AI-guided reasoning workflow that transforms ambiguous ideas into validated project decisions.

**North Star Metric:** The moment when users say *"Now I know what I actually need to build."*

---

## The Problem

First-time builders frequently fail to move from ideas to implementation because they become trapped in an **unstructured discovery process**:

```
I have an idea → I'm not sure what the problem is → Search for references → Compare
→ Discuss with AI → Still confused → Search for more references → Add more features
→ Still not confident → Never start building
```

### Key Pain Points

| Pain Point | Description |
|---|---|
| **Vague Ideas** | "I have an idea for an education app" — but don't know for whom or what problem it solves |
| **Too Many Solutions** | Analysis paralysis from too many alternatives |
| **Assumptions vs Facts** | Assumptions treated as facts without validation |
| **No Progress Tracking** | No way to see how far discovery has progressed |
| **Fear of Commitment** | Fear of choosing the wrong direction |
| **Never Reaching MVP** | The discovery process never finishes |

### Target Users

- **Students** — Thesis projects, research, campus startups
- **Hackathon Participants** — Need clear direction in a short time
- **Capstone Students** — Final projects with limited time
- **Junior Founders** — First-time founders with many ideas
- **Beginner Indie Builders** — Solo builders experiencing analysis paralysis

---

## The Solution

Distill transforms **Ambiguous Ideas** into **Structured Thinking** → **Validated Direction** → **Actionable Project**.

```
Messy Thoughts
      ↓
Structured Thinking
      ↓
Validated Direction
      ↓
Actionable Project
```

### What Distill IS

- **AI Creative Reasoning Companion** — Guides users through structured discovery
- **Thinking Canvas** — Visual representation of discovery progress
- **Distillation Engine** — Reduces complexity until only valid insights remain

### What Distill is NOT

- ❌ ChatGPT Clone / AI Chatbot
- ❌ AI Idea Generator / Brainstorming Tool
- ❌ Business Planner / Business Model Canvas
- ❌ Project Management Tool (Notion, Jira, Linear)
- ❌ Collaboration Platform (Miro, Confluence)
- ❌ Coding Assistant

### Product Philosophy

1. **AI Guides, Not Replaces** — The final decision always belongs to the user
2. **Questions Before Answers** — AI asks more questions than it gives answers
3. **Evidence Over Opinion** — Every recommendation is grounded in evidence
4. **Distill, Don't Expand** — Narrow the solution space instead of expanding it
5. **Visual Thinking** — Reasoning can be seen, not just read
6. **Human-in-the-Loop** — Users confirm, correct, and validate every insight
7. **Transparency Over Magic** — Users can see how the AI reached its conclusions
8. **Confidence Is Earned** — The AI acknowledges uncertainty when evidence is weak

---

## Core Mechanisms

### 1. Stage-Based Reasoning (10-Stage Thinking Flow)

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

The user does not select the stage. The AI automatically determines the stage based on the conversation content.

### 2. Thinking Canvas (Guided Thinking Workspace)

A card-based visual workspace that is automatically populated by the AI based on conversation:

- **10 stage-based cards** with icons and status indicators
- **3 states per card:** Not Started (⚪), In Progress (🟡), Completed (🟢)
- **4-section detail:** Summary → Confirmed → Needs Validation → Next Step
- **Real-time updates** — every user message triggers a canvas update
- **No manual editing** — all changes occur through chat

### 3. Distillation Engine

Gradually reduces complexity through 5 phases:

1. **Collection** — Gather all ideas, pain points, assumptions without filtering
2. **Clustering** — Group similar items, identify duplications
3. **Validation** — Flag weak assumptions, prioritize evidence-backed items
4. **Convergence** — Select the most valid direction, discard irrelevant options
5. **Synthesis** — Summarize into a single insight with confidence score

### 4. Impact Detection & Consistency

When a user changes a decision, the AI automatically detects its impact on other stages and flags them for review, maintaining consistency across the entire canvas.

### 5. Confidence Scoring

Each insight carries a transparent confidence score:
- **High (80-100%)** — Strong evidence, consistent
- **Medium (50-79%)** — Some evidence, needs validation
- **Low (0-49%)** — Based on assumptions
- **Needs Validation** — No data available yet

---

## Product Output

### Project Blueprint

The final output is a **Project Blueprint** — a handoff document ready for planning and development:

| # | Component | Description |
|---|---|---|
| 1 | Project Name | Name of the project |
| 2 | Problem Statement | Validated problem description |
| 3 | Primary User | Target user persona |
| 4 | Workflow | Current user workflow |
| 5 | Core Pain Point | Validated main pain point |
| 6 | Root Cause | Underlying cause of the problem |
| 7 | Key Evidence | Evidence supporting the findings |
| 8 | Opportunity | The opportunity identified |
| 9 | Decision | Final decision made |
| 10 | MVP Scope | Minimum viable product features |
| 11 | Next Validation | Steps to validate further |

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA with 3-panel layout |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Routing** | React Router | Project list ↔ workspace navigation |
| **State UI** | Zustand | Lightweight state management |
| **Backend** | Express.js | REST API server |
| **Database** | SQLite | Single-file, zero-config storage |
| **AI** | Gemini API (Google) | Single LLM with stage-based prompts |
| **Deployment** | Render | Auto-deploy from GitHub |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         RENDER (Cloud)                         │
│                                                                │
│  ┌─────────────────────┐      ┌─────────────────────────────┐ │
│  │   Static Site       │      │   Web Service               │ │
│  │   (Frontend)        │◄────►│   (Backend + SQLite)        │ │
│  │                     │      │                             │ │
│  │  React + Vite       │      │  Express.js                 │ │
│  │  Tailwind CSS       │      │  SQLite (file)              │ │
│  │  Zustand            │      │  Gemini API client          │ │
│  └─────────────────────┘      └─────────────────────────────┘ │
│           │                              │                     │
│           │      HTTPS (REST)            │                     │
│           └──────────────────────────────┘                     │
│                              │                                 │
│                              ▼                                 │
│                    ┌─────────────────┐                         │
│                    │  Google Gemini  │                         │
│                    │  API (v1beta)   │                         │
│                    └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### AI Reasoning Flow (Per Turn)

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
│  Merge + Impact │  → Canvas state updated in SQLite
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
Response to user + updated canvas
```

---

## Project Structure

```
distill/
├── package.json              # Root: build + start scripts
├── vite.config.js            # Frontend build config
├── tailwind.config.js        # Tailwind config
├── index.html                # HTML entry
├── src/                      # Frontend (React)
│   ├── main.jsx
│   ├── App.jsx
│   ├── store/
│   │   └── useProjectStore.js
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── ChatPanel.jsx
│   │   ├── CanvasPanel.jsx
│   │   ├── CanvasCard.jsx
│   │   ├── DetailPanel.jsx
│   │   ├── BlueprintModal.jsx
│   │   └── ProjectList.jsx
│   ├── hooks/
│   │   └── useChat.js
│   └── api/
│       └── client.js
├── server/                   # Backend (Express)
│   ├── index.js
│   ├── db.js
│   ├── routes/
│   │   ├── projects.js
│   │   ├── chat.js
│   │   └── blueprint.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── canvasService.js
│   │   └── blueprintService.js
│   └── prompts/
│       ├── extract.js
│       └── converse.js
├── docs/                     # Documentation
│   ├── 00-project-overview.md
│   ├── 01-problem-analysis.md
│   ├── 02-solution-overview.md
│   ├── 03-business-process.md
│   ├── 04-functional-requirement.md
│   ├── 05-database-design.md
│   ├── 06-system-design.md
│   ├── 07-ai-design.md
│   ├── 08-api-design.md
│   └── 09-project-management.md
└── dist/                     # Build output (auto-generated)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Andrian206/distill.git
cd distill

# Install dependencies
npm install

# Set up environment variables
export GEMINI_API_KEY=your_api_key_here
export PORT=10000

# Start development server
npm run dev
```

### Development

The frontend dev server runs on `http://localhost:5173` and the backend API on `http://localhost:10000`.

### Build for Production

```bash
npm run build
npm start
```

### Deployment (Render)

1. Connect your GitHub repository to Render
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables:
   - `GEMINI_API_KEY` (secret)
   - `NODE_ENV=production`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Get project with full canvas |
| `POST` | `/api/chat` | Send message, get AI response + canvas updates |
| `GET` | `/api/chat/:project_id` | Get chat history |
| `POST` | `/api/blueprint/:project_id` | Generate blueprint |
| `GET` | `/api/blueprint/:project_id` | Get existing blueprint |
| `GET` | `/api/health` | Service health check |

---

## Development Roadmap

```
Week 1          Week 2          Week 3          Week 4
│               │               │               │
▼               ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Sprint 1│   │ Sprint 2│   │ Sprint 3│   │ Sprint 4│
│ Setup + │   │ Core    │   │ AI +    │   │ Polish +│
│ UI Shell│   │ Chat +  │   │ Canvas  │   │ Demo    │
│         │   │ Canvas  │   │ Reasoning│   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
```

- **Sprint 1:** Init repo, Vite + React + Tailwind, SQLite schema, Express server, 3-panel layout, deploy to Render
- **Sprint 2:** ChatPanel UI, CanvasPanel with 10 cards, DetailPanel, Zustand store, POST /chat endpoint (mock AI)
- **Sprint 3:** Gemini API client, Prompt A (extraction), Prompt B (conversation), canvas auto-update, impact detection, distillation, blueprint generation
- **Sprint 4:** Blueprint modal, empty state/onboarding, error handling, demo script, bug fixes, final deploy

---

## Documentation

All project documentation is available in the [`docs/`](./docs/) directory:

| Document | Description |
|---|---|
| [00-project-overview.md](./docs/00-project-overview.md) | Project overview, vision, mission, scope |
| [01-problem-analysis.md](./docs/01-problem-analysis.md) | Problem analysis, pain points, root causes |
| [02-solution-overview.md](./docs/02-solution-overview.md) | Solution architecture, core mechanisms |
| [03-business-process.md](./docs/03-business-process.md) | Business process flow, state machine |
| [04-functional-requirement.md](./docs/04-functional-requirement.md) | 31 functional requirements across 7 modules |
| [05-database-design.md](./docs/05-database-design.md) | Database schema (SQLite), ERD, query patterns |
| [06-system-design.md](./docs/06-system-design.md) | System architecture, component breakdown, deployment |
| [07-ai-design.md](./docs/07-ai-design.md) | AI architecture, prompts, reasoning flow |
| [08-api-design.md](./docs/08-api-design.md) | REST API endpoints, request/response schemas |
| [09-project-management.md](./docs/09-project-management.md) | Sprint plan, task board, risk mitigation |

---

## License

This project is part of a AI Builders Challenge with IBM Bob MVP. All rights reserved.
