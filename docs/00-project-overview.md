# 00 — Project Overview

## Project Information

| Attribute                 | Value                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Project Name**          | Distill                                                                                                             |
| **Tagline**               | From Ambiguity to Action.                                                                                           |
| **Category**              | AI Creative Reasoning Companion                                                                                     |
| **MVP Target**            | Hackathon Demo (3 minutes)                                                                                          |
| **Primary Target Users**  | First-time Builders (students, hackathon participants, capstone students, junior founders, beginner indie builders) |
| **Product Design Status** | **Frozen (v1.0)** — No concept changes                                                                              |
| **Current Phase**         | Technical Design & Implementation                                                                                   |

---

## Executive Summary

Distill is an **AI Creative Reasoning Companion** that helps first-time builders transform ambiguous ideas into validated project directions through a structured discovery process.

Unlike chatbots or AI idea generators, Distill does not focus on generating more ideas. Instead, it helps users understand, validate, and commit to a single project direction worth building.

---

## Vision

> Helping people think before they build.

AI does not replace human creativity. AI helps people think better.

---

## Mission

Provide an AI-guided reasoning workflow that transforms ambiguous ideas into validated project decisions.

---

## North Star Metric

The success of Distill is not measured by the length of the conversation, but by the moment when users say:

> *"Now I know what I actually need to build."*

Or, in one sentence:

> **Distill does not help users create more ideas. Distill helps users commit to one.**

---

## Core Value Proposition

```
Messy Thoughts
      ↓
Structured Thinking
      ↓
Validated Direction
      ↓
Actionable Project
```

Distill transforms **Ambiguous Ideas** into **Structured Thinking** → **Validated Direction** → **Actionable Project**.

---

## Positioning

### Distill is NOT:

* ChatGPT Clone
* AI Chatbot / Conversational AI
* AI Idea Generator / Brainstorming Tool
* Business Planner / Business Model Canvas
* Project Management Tool (Notion, Jira, Linear, Trello)
* Collaboration Platform (Miro, Confluence)
* Coding Assistant
* Software Architecture Recommender

### Distill IS:

> **AI Creative Reasoning Companion**

Alternative: AI Creative Discovery Companion

---

## Product Philosophy

1. **AI Guides, Not Replaces** — The final decision always belongs to the user.
2. **Questions Before Answers** — AI asks more questions than it gives answers.
3. **Evidence Over Opinion** — Every recommendation is grounded in evidence.
4. **Distill, Don't Expand** — Narrow the solution space instead of expanding it.
5. **Visual Thinking** — Reasoning can be seen, not just read.
6. **Human-in-the-Loop** — Users confirm, correct, and validate every insight.
7. **Transparency Over Magic** — Users can see how the AI reached its conclusions.
8. **Confidence Is Earned** — The AI acknowledges uncertainty when evidence is weak.

---

## Core Problem

Many first-time builders stop not because they lack ideas, but because:

* Their ideas are still vague and ambiguous
* They are unsure what the real problem is
* There are too many possible solutions
* They struggle to prioritize and identify target users
* They find it difficult to distinguish assumptions from facts
* They are afraid of choosing the wrong direction
* They keep discussing without ever starting to build

**The workflow Distill aims to break:**

```
I have an idea → I'm not sure what the problem is → Search for references → Compare
→ Discuss with AI → Still confused → Search for more references → Add more features
→ Still not confident → Never start building
```

---

## Target Users (MVP)

| Segment                 | Examples                                              |
| ----------------------- | ----------------------------------------------------- |
| Students                | Thesis projects, research, campus startups            |
| Hackathon Participants  | Need clear direction in a short amount of time        |
| Capstone Students       | Final projects with limited time                      |
| Junior Founders         | First-time founders with many ideas                   |
| Beginner Indie Builders | Solo builders who often experience analysis paralysis |

**Characteristics:**

* Many ideas, little experience
* Easily distracted and struggle to prioritize
* Afraid of making the wrong decision
* Frequently overthink and experience analysis paralysis

---

## MVP Scope (In Scope vs Out of Scope)

### ✅ In Scope

* AI Conversation (Thinking Partner)
* Thinking Canvas (Guided Thinking Workspace)
* AI Guided Discovery (Stage-Based Reasoning)
* Project Blueprint Generation
* Distillation Engine

### ❌ Out of Scope

* Authentication / Login
* Collaboration / Multi-user
* Complex Dashboard
* Sprint Planning / Kanban / Task Tracking
* Software Architecture Recommendation
* Coding Assistant / Deployment
* PDF / Markdown Export
* Timeline Management
* Fishbone Diagram

---

## Core Experience

### Thinking Flow (Internal Framework)

```
💡 Idea
   ↓
👤 User
   ↓
🔄 Workflow
   ↓
⚠ Pain Point
   ↓
🌱 Root Cause
   ↓
❓ Assumption
   ↓
📄 Evidence
   ↓
✨ Opportunity
   ↓
✅ Decision
   ↓
🚀 MVP
```

### Thinking Canvas

* **Not a graph. Not a flowchart.**
* It is a **Guided Thinking Workspace** — a visual representation of the user's discovery progress.
* Users **do not fill out the canvas manually**.
* The AI understands the conversation and updates the canvas automatically.
* The canvas shows the user's thinking progress.

### AI Personality

The AI is a **Thinking Partner**, not a lecturer, interviewer, or consultant.

* Does not judge
* Does not always agree
* Does not give excessive praise
* Will challenge assumptions
* Critiques ideas, not the user
* Guides through questions
* Keeps the discussion focused

---

## Distillation

The core of Distill is the **distillation** process—gradually reducing ambiguity by:

* Eliminating weak assumptions
* Merging similar ideas
* Removing duplication
* Prioritizing evidence
* Detecting contradictions
* Narrowing alternatives
* Increasing confidence in decisions

**Example:**

```
20 Features → 10 → 5 → 3
12 Pain Points → 6 → 3 → 1
8 Opportunities → 4 → 2 → 1
```

---

## Primary Output: Project Blueprint

The Blueprint is a handoff document ready to be used for planning and development.

Blueprint Contents:

1. Project
2. Problem Statement
3. Primary User
4. Workflow
5. Core Pain Point
6. Root Cause
7. Evidence
8. Opportunity
9. Decision
10. MVP
11. Next Validation

---

## Success Criteria

Success occurs when users finish the session with enough clarity and confidence to begin building, rather than continuing to search for more ideas.

---

## Frozen Decisions

| Aspect           | Decision                                    |
| ---------------- | ------------------------------------------- |
| Product Name     | Distill                                     |
| Tagline          | From Ambiguity to Action                    |
| Positioning      | AI Creative Reasoning Companion             |
| Target Users     | First-time Builders                         |
| Core Value       | Ambiguous Idea → Clear Direction            |
| Core Experience  | Thinking Canvas (Guided Thinking Workspace) |
| Thinking Flow    | 10 Stages (Idea → MVP)                      |
| AI Architecture  | Single LLM + Stage-Based Prompt             |
| UI Layout        | 3 Panels (Chat + Canvas + Details)          |
| Output           | Project Blueprint                           |
| Canvas Editing   | Conversation-only, no manual editing        |
| Stage Navigation | Determined automatically by the AI          |

---

## Development Principle

> **Simplicity is more important than features.**

Every implementation decision should be evaluated by asking one question:

> **"Does this reduce ambiguity?"**

YES → Keep

NO → Reject

---

## Recommended MVP Tech Stack

| Layer    | Technology                  |
| -------- | --------------------------- |
| Frontend | React + Vite + Tailwind CSS |
| Routing  | React Router                |
| Backend  | Express.js                  |
| AI       | Gemini API (Single LLM)     |
| Storage  | SQLite / JSON File          |
