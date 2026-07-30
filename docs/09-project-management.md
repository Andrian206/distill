# 09 — Project Management

## 1. Development Roadmap

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

---

## 2. Sprint Breakdown

### Sprint 1 — Setup & UI Shell (Days 1-7)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Init repo, Vite + React + Tailwind | Dev | Running dev server |
| SQLite schema + db helper | Dev | `db.js` with create/read/update |
| Express server skeleton | Dev | `server/index.js` with health endpoint |
| 3-panel layout component | Dev | `Layout.jsx` with resizable panels |
| Project list page | Dev | `ProjectList.jsx` with create/delete |
| Deploy to Render | Dev | Live URL (SQLite temp, session-only) |

**Definition of Done:** App opens, can create project, layout renders.

---

### Sprint 2 — Core Chat & Canvas (Days 8-14)

| Task | Owner | Deliverable |
|------|-------|-------------|
| | ChatPanel UI + message display | Dev | Send/receive messages visible |
| | CanvasPanel with 10 cards | Dev | Cards render with status colors |
| | DetailPanel with 4 sections | Dev | Click card shows detail |
| | Zustand store for project state | Dev | State shared across panels |
| | POST /chat endpoint (mock AI) | Dev | Messages saved, echo response |
| | Session state in memory | Dev | State persists during active session |
| | Project list page | Dev | List/create/delete projects |

**Definition of Done:** Full chat + canvas flow works with mock AI.

---

### Sprint 3 — AI Integration & Reasoning (Days 15-21)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Gemini API client | Dev | `aiService.js` calls Gemini |
| Prompt A (extraction) | Dev | Returns valid JSON for test inputs |
| Prompt B (conversation) | Dev | Natural response for test inputs |
| Canvas auto-update from AI | Dev | Chat triggers canvas changes |
| Impact detection logic | Dev | Changing user marks workflow needs_review |
| Distillation prompt | Dev | Reduces 4 pain points to 1 core |
| Blueprint generation prompt | Dev | Returns 11-section JSON |

**Definition of Done:** Full AI loop works end-to-end with real Gemini.

---

### Sprint 4 — Polish & Demo Prep (Days 22-28)

| Task | Owner | Deliverable |
|------|-------|-------------|
| Blueprint modal / display | Dev | Blueprint renders nicely |
| Empty state / onboarding | Dev | First-time user sees guidance |
| Error handling (AI fail, timeout) | Dev | Graceful fallback UI |
| Demo scenario script | Team | 3-minute walkthrough |
| Bug fixes from testing | Dev | Zero critical bugs |
| Final Render deploy | Dev | Production URL stable |

**Definition of Done:** Demo runs smoothly without manual fixes.

---

## 3. Task Board (Simplified)

| Status | Tasks |
|--------|-------|
| **To Do** | Blueprint export, Collaboration, Auth |
| **In Progress** | — |
| **Done** | Product Design Freeze, Database Design, System Design, AI Design, API Design |

---

## 4. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini API rate limit / cost | High | Use free tier, cache prompts, limit context to last 5 messages |
| JSON parsing fails from AI | Medium | Retry once, fallback to chat-only response |
| SQLite data lost on refresh | Expected | By design — session-only for MVP |
| Scope creep | High | Strict MVP gate: no auth, no export, no collaboration |
| AI hallucinates data | Medium | Validate structured output against user message |

---

## 5. Definition of Done (per feature)

- [ ] Code written and self-reviewed
- [ ] Works in local dev
- [ ] Works on Render deploy
- [ ] No console errors
- [ ] Feature matches acceptance criteria in 04-functional-requirement.md
- [ ] Committed to main branch

---

## 6. Success Criteria (MVP)

| Criteria | Target | How to measure |
|----------|--------|----------------|
| Demo completion | 3 min | Timer during rehearsal |
| End-to-end flow | 1 path | User creates project → chats → gets blueprint |
| AI response time | < 5s | Stopwatch on POST /chat |
| Zero crashes | 0 | Manual testing 5 sessions |
| Blueprint quality | Valid JSON | Automated check on output |

---

## 7. Post-MVP Backlog (Not Now)

| Feature | Priority |
|---------|----------|
| User authentication | Low |
| Export PDF / Markdown | Low |
| Collaboration / multi-user | Low |
| RAG / knowledge base | Low |
| Multi-agent architecture | Low |
| Interview synthesis | Low |
| Analytics dashboard | Low |

---

## 8. Team & Communication

| Role | Responsibility |
|------|----------------|
| Product Owner | Final call on scope, demo script |
| Developer | Implementation, deploy, bug fixes |
| AI / Prompt Engineer | Prompt tuning, JSON reliability |

**Check-in:** Daily async update (text). Weekly sync call.
