# 08 — API Design

## 1. Base URL

```
Production:  https://distill.onrender.com/api
Development: http://localhost:10000/api
```

---

## 2. Endpoints

### 2.1 Projects

**Note:** No project list endpoint. Each session starts fresh.

---

#### POST /projects
Create new project (starts fresh session).

**Body:**
```json
{
  "name": "EduRecord"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "EduRecord",
  "status": "discovering",
  "created_at": "2026-07-28T10:00:00Z",
  "updated_at": "2026-07-28T10:00:00Z",
  "canvas_id": "uuid"
}
```

Side effect: Creates canvas with 10 stages (all `not_started`).

---

#### GET /projects/:id
Get project with full canvas.

**Response 200:**
```json
{
  "id": "uuid",
  "name": "EduRecord",
  "status": "discovering",
  "created_at": "...",
  "updated_at": "...",
  "canvas": {
    "id": "uuid",
    "stages": [
      {
        "id": "uuid",
        "name": "idea",
        "status": "complete",
        "summary": "Student record app",
        "confidence": 90,
        "order_index": 0,
        "items": [
          {"id": "uuid", "type": "confirmed", "content": "...", "order_index": 0}
        ]
      }
    ]
  }
}
```

---


---

### 2.2 Chat

#### POST /chat
Send message, get AI response + canvas updates.

**Body:**
```json
{
  "project_id": "uuid",
  "message": "Saya ingin membuat aplikasi untuk guru..."
}
```

**Response 200:**
```json
{
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "Got it — teachers are your main users...",
    "timestamp": "2026-07-28T10:05:00Z",
    "turn_number": 3
  },
  "canvas_updates": {
    "idea": {"action": "replace", "status": "complete", "summary": "...", "confidence": 90},
    "user": {"action": "replace", "status": "complete", "summary": "...", "confidence": 85}
  },
  "impact": {
    "affected_stages": []
  },
  "missing_stages": ["workflow"]
}
```

Side effect: Saves user message and AI message to `messages` table. Updates canvas in SQLite.

---

#### GET /chat/:project_id
Get chat history for a project.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "role": "user",
    "content": "Saya ingin...",
    "timestamp": "2026-07-28T10:00:00Z",
    "turn_number": 1
  },
  {
    "id": "uuid",
    "role": "assistant",
    "content": "...",
    "timestamp": "2026-07-28T10:01:00Z",
    "turn_number": 2
  }
]
```

---

### 2.3 Blueprint

#### POST /blueprint/:project_id
Generate blueprint after distillation.

**Body:**
```json
{
  "approve": true
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "content": {
    "project_name": "EduRecord",
    "problem_statement": "...",
    "primary_user": "...",
    "workflow": "...",
    "core_pain_point": "...",
    "root_cause": "...",
    "key_evidence": ["..."],
    "opportunity": "...",
    "decision": "...",
    "mvp_scope": ["..."],
    "next_validation": ["..."],
    "reasoning_summary": "...",
    "confidence_overall": 82
  },
  "generated_at": "2026-07-28T10:30:00Z"
}
```

Side effect: Updates project status to `completed`.

---

#### GET /blueprint/:project_id
Get existing blueprint.

**Response 200:** Same as POST response.
**Response 404:** If blueprint not yet generated.

---

### 2.4 Health

#### GET /health
Service health check.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-28T10:00:00Z"
}
```

---

## 3. Error Responses

All errors use this shape:

```json
{
  "error": "description",
  "code": "ERROR_CODE"
}
```

| Status | Code | When |
|--------|------|------|
| 400 | INVALID_INPUT | Missing required field |
| 404 | NOT_FOUND | Project/blueprint not found |
| 500 | AI_ERROR | Gemini API failure |
| 500 | DB_ERROR | SQLite operation failed |

---

## 4. CORS

```javascript
// Express middleware
app.use(cors({
  origin: true,  // Allow all for MVP
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
```

---

## 5. Rate Limiting

Not implemented for MVP. Add later if needed.