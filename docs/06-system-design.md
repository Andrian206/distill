# 06 — System Design

## 1. Deployment Target

**Platform:** Render (Web Service + SQLite)
**Reason:** Free tier, auto-deploy from GitHub, sufficient for MVP without complex infrastructure.

---

## 2. Final Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| Frontend | React 18 + Vite | SPA, 3-panel layout |
| Styling | Tailwind CSS | Utility-first, fast |
| Routing | React Router | Project list ↔ workspace navigation |
| State UI | Zustand | Lightweight, no Redux needed |
| Backend | Express.js | Simple REST API |
| Database | SQLite (file) | Single file, zero config, sufficient for MVP |
| ORM | None | Raw queries with helper functions |
| AI | Gemini API (Google) | AI Reasoning Engine (Multi-Engine) |
| HTTP Client | Fetch (native) | Frontend to backend |
| Deployment | Render Web Service | Auto-deploy on push |

---

## 3. System Architecture

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
│  │                     │      │                             │ │
│  │  Build: dist/       │      │  Port: 10000                │ │
│  │  Served by Render   │      │  DB: /data/distill.db       │ │
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

**Note:** Frontend and backend can be deployed as a single Web Service (Express serving static build) for MVP simplification.

---

## 4. Component Breakdown

### 4.1 Frontend (React)

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root + Router
├── store/
│   └── useProjectStore.js    # Zustand: project, canvas, chat state
├── components/
│   ├── Layout.jsx        # 3-panel container
│   ├── ChatPanel.jsx     # Left panel: conversation
│   ├── CanvasPanel.jsx   # Middle panel: 10 cards
│   ├── CanvasCard.jsx    # Single stage card
│   ├── DetailPanel.jsx   # Right panel: card detail
│   ├── BlueprintModal.jsx # Blueprint overlay
│   └── ProjectList.jsx   # Project list page
├── hooks/
│   └── useChat.js        # Message send/receive logic
└── api/
    └── client.js         # Fetch wrapper to backend
```

### 4.2 Backend (Express)

```
server/
├── index.js              # Entry point, middleware, routes, static serving
├── db.js                 # SQLite connection + helpers + migrations
├── migrations/           # DB Schema version control
│   ├── 002_add_evidence_tracking.sql
│   ├── 003_add_contradictions.sql
│   └── README.md
├── routes/
│   ├── projects.js       # Project CRUD + greeting generation
│   ├── chat.js           # POST/GET /chat (AI reasoning + context compression)
│   └── blueprint.js      # GET/POST /blueprint/:id (preview + generation)
├── services/
│   ├── aiService.js      # Gemini API client (extract, respond, distill, blueprint)
│   ├── canvasService.js  # Canvas state logic (merge, impact, stage lock)
│   ├── blueprintService.js # Blueprint compilation (JS fallback)
│   ├── confidenceEngine.js # Confidence calculation (evidence, consistency, completeness)
│   ├── contradictionEngine.js # Contradiction detection and handling
│   ├── modeEngine.js     # Conversation mode selection (6 modes)
│   ├── progressEngine.js # Progress tracking and detection
│   └── promptComposer.js # Dynamic prompt assembly (reasoning state + memory)
└── prompts/
    ├── system.js         # Core persona instructions
    ├── extract.js        # Information extraction (Prompt A)
    ├── converse.js       # Standard conversation response
    ├── reflect.js        # Reflection/synthesis mode
    ├── distill.js        # Distillation prompt
    ├── summarize.js      # Context compression/summarization
    └── blueprint.js      # Blueprint compilation
```

---

## 5. Data Flow (Simplified)

```
[User types in ChatPanel]
         │
         ▼
[useChat → POST /api/chat]
         │
         ▼
[Express receives: {projectId, message, canvasState}]
         │
         ▼
[aiService: Prompt A → Gemini → structured JSON]
         │
         ▼
[canvasService: merge updates → save to SQLite]
         │
         ▼
[aiService: Prompt B → Gemini → natural response]
         │
         ▼
[Express responds: {aiMessage, canvasUpdates, impactReport}]
         │
         ▼
[useProjectStore: update canvas + append chat]
         │
         ▼
[UI re-renders: ChatPanel + CanvasPanel + DetailPanel]
```

---

## 6. Render Deployment Strategy

### 6.1 Single-Service Deploy (Recommended for MVP)

Frontend is built to `dist/`, Express serves static files + API from the same path.

```javascript
// server/index.js (simplified)
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use('/api', require('./routes'));

// Serve React build
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(process.env.PORT || 10000);
```

**Benefits:** Single service, single URL, single build pipeline.

**Note:** SQLite in `/tmp/` — data is lost on redeploy/refresh. Sufficient for MVP sessions.

### 6.2 Environment Variables (Render)

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | 10000 | Render auto-set |
| `GEMINI_API_KEY` | sk-... | Render Secret File |
| `DB_PATH` | /tmp/distill.db | Temp file (session-only) |
| `NODE_ENV` | production | Render auto-set |

---

## 7. Request Lifecycle

```
1. Request arrives → Express middleware (json, cors)
2. Route handler validates input
3. Load canvas state from SQLite
4. Assemble prompt (current canvas + user message)
5. Call Gemini API (single request, or sequential: A then B)
6. Parse structured response
7. Update SQLite (canvas + messages)
8. Return JSON to frontend
9. Frontend updates Zustand store
10. React re-renders related components
```

---

## 8. No Overengineering Principles

| Don't Use | Use Instead |
|-----------|-------------|
| PostgreSQL / MySQL | SQLite (single file) |
| Docker / Kubernetes | Direct deploy to Render |
| Redis / Cache layer | In-memory (Express) |
| Auth / JWT | None (MVP without login) |
| WebSocket / SSE | HTTP polling / standard request-response |
| Microservices | Monolith (Single Express file) |
| Redux / Context API | Zustand (1 file) |
| ORM (Prisma/Sequelize) | Raw SQL helper functions |
| CI/CD pipeline | Render auto-deploy from GitHub |
| Load balancer | Not needed (single instance) |

---

## 9. File Tree (MVP)

```
distill/
├── package.json          # Root: build + start scripts
├── vite.config.js        # Frontend build config
├── tailwind.config.js    # Tailwind config
├── index.html            # HTML entry
├── src/                  # Frontend (React)
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
├── server/               # Backend (Express)
│   ├── index.js
│   ├── db.js
│   ├── migrations/       # DB Schema migrations
│   ├── routes/
│   │   ├── projects.js
│   │   ├── chat.js
│   │   └── blueprint.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── canvasService.js
│   │   ├── blueprintService.js
│   │   ├── confidenceEngine.js
│   │   ├── contradictionEngine.js
│   │   ├── modeEngine.js
│   │   ├── progressEngine.js
│   │   └── promptComposer.js
│   └── prompts/
│       ├── blueprint.js
│       ├── converse.js
│       ├── distill.js
│       ├── extract.js
│       ├── reflect.js
│       ├── summarize.js
│       └── system.js
└── dist/                 # Build output (auto-generated)
```

---

## 10. Health Check

```
GET /health
Response: { "status": "ok", "timestamp": "2026-07-28T15:30:00Z" }
```

Render uses this endpoint for service health checks.