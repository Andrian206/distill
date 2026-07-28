# 05 — Database Design

## 1. Overview

Dokumen ini mendefinisikan model data untuk Distill pada level conceptual, logical, dan physical. Desain ini mendukung project lifecycle, canvas state persistence, chat history, dan blueprint generation tanpa redundansi.

---

## 2. Conceptual ERD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONCEPTUAL ENTITY RELATIONSHIP                        │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │   PROJECT    │         │   CANVAS     │         │   MESSAGE    │
    │              │◄───────►│              │         │              │
    │  id          │    1:1  │  id          │         │  id          │
    │  name        │         │  project_id  │         │  project_id  │
    │  status      │         │  updated_at  │         │  role        │
    │  created_at  │         │              │         │  content     │
    │  updated_at  │         │              │         │  timestamp   │
    └──────┬───────┘         └──────┬───────┘         └──────────────┘
           │                        │
           │                        │ 1:N
           │                        ▼
           │                 ┌──────────────┐
           │                 │    STAGE     │
           │                 │              │
           │                 │  id          │
           │                 │  canvas_id   │
           │                 │  name        │
           │                 │  status      │
           │                 │  summary     │
           │                 │  confidence  │
           │                 │  order_index │
           │                 └──────┬───────┘
           │                        │ 1:N
           │                        ▼
           │                 ┌──────────────┐
           │                 │  STAGE_ITEM  │
           │                 │              │
           │                 │  id          │
           │                 │  stage_id    │
           │                 │  type        │
           │                 │  content     │
           │                 │  order_index │
           │                 └──────────────┘
           │
           │ 1:0..1
           ▼
    ┌──────────────┐
    │  BLUEPRINT   │
    │              │
    │  id          │
    │  project_id  │
    │  content     │
    │  generated_at│
    └──────────────┘
```

**Relasi:**
- `PROJECT` 1:1 `CANVAS` — Setiap project memiliki tepat satu canvas.
- `PROJECT` 1:N `MESSAGE` — Setiap project memiliki banyak pesan chat.
- `CANVAS` 1:N `STAGE` — Setiap canvas memiliki tepat 10 stage.
- `STAGE` 1:N `STAGE_ITEM` — Setiap stage memiliki banyak item (confirmed, needs_validation, next_step).
- `PROJECT` 1:0..1 `BLUEPRINT` — Setiap project memiliki nol atau satu blueprint.

---

## 3. Logical ERD

### 3.1 Entity: PROJECT

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique project identifier |
| name | VARCHAR(255) | NOT NULL | Project name (user-defined or default) |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'discovering' | Lifecycle state: discovering, distilling, validating, completed |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Project creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification time |

### 3.2 Entity: CANVAS

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique canvas identifier |
| project_id | UUID | FK → PROJECT.id, UNIQUE, NOT NULL | One-to-one with project |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last canvas update time |

### 3.3 Entity: STAGE

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique stage identifier |
| canvas_id | UUID | FK → CANVAS.id, NOT NULL | Parent canvas |
| name | VARCHAR(50) | NOT NULL | Stage key: idea, user, workflow, pain_point, root_cause, assumption, evidence, opportunity, decision, mvp |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'not_started' | not_started, partial, complete, needs_review |
| summary | TEXT | NULL | Distilled core insight for this stage |
| confidence | INTEGER | NULL, CHECK (0-100) | Confidence score (0-100%) |
| order_index | INTEGER | NOT NULL, CHECK (0-9) | Display order: 0=idea, 1=user, ..., 9=mvp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Stage creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Unique Constraint:** `(canvas_id, name)` — satu canvas tidak boleh punya stage name duplikat.

### 3.4 Entity: STAGE_ITEM

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique item identifier |
| stage_id | UUID | FK → STAGE.id, NOT NULL | Parent stage |
| type | VARCHAR(50) | NOT NULL | confirmed, needs_validation, next_step |
| content | TEXT | NOT NULL | Item text content |
| order_index | INTEGER | NOT NULL, DEFAULT 0 | Display order within type |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Item creation time |

### 3.5 Entity: MESSAGE

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique message identifier |
| project_id | UUID | FK → PROJECT.id, NOT NULL | Parent project |
| role | VARCHAR(20) | NOT NULL, CHECK (user, assistant, system) | Message sender |
| content | TEXT | NOT NULL | Message text content |
| structured_data | JSONB | NULL | AI extraction output (canvas updates, impact report) |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | Message send time |
| turn_number | INTEGER | NOT NULL | Conversation turn index |

### 3.6 Entity: BLUEPRINT

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique blueprint identifier |
| project_id | UUID | FK → PROJECT.id, UNIQUE, NOT NULL | One-to-one with project |
| content | JSONB | NOT NULL | Full blueprint document as structured JSON |
| generated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Generation time |

---

## 4. Physical Schema (SQLite)

```sql
-- ============================================================
-- 05 — Physical Database Schema (SQLite)
-- ============================================================

-- --------------------------------------------------------
-- Table: projects
-- --------------------------------------------------------
CREATE TABLE projects (
    id            TEXT PRIMARY KEY,           -- UUID v4
    name          TEXT NOT NULL DEFAULT 'Untitled Project',
    status        TEXT NOT NULL DEFAULT 'discovering'
                  CHECK (status IN ('discovering', 'distilling', 'validating', 'completed')),
    created_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at    DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- --------------------------------------------------------
-- Table: canvases
-- --------------------------------------------------------
CREATE TABLE canvases (
    id            TEXT PRIMARY KEY,
    project_id    TEXT NOT NULL UNIQUE,
    updated_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: stages
-- --------------------------------------------------------
CREATE TABLE stages (
    id            TEXT PRIMARY KEY,
    canvas_id     TEXT NOT NULL,
    name          TEXT NOT NULL
                  CHECK (name IN (
                      'idea', 'user', 'workflow', 'pain_point',
                      'root_cause', 'assumption', 'evidence',
                      'opportunity', 'decision', 'mvp'
                  )),
    status        TEXT NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'partial', 'complete', 'needs_review')),
    summary       TEXT,
    confidence    INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    order_index   INTEGER NOT NULL CHECK (order_index >= 0 AND order_index <= 9),
    created_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE,
    UNIQUE (canvas_id, name)
);

CREATE INDEX idx_stages_canvas ON stages(canvas_id);
CREATE INDEX idx_stages_status ON stages(status);

-- --------------------------------------------------------
-- Table: stage_items
-- --------------------------------------------------------
CREATE TABLE stage_items (
    id            TEXT PRIMARY KEY,
    stage_id      TEXT NOT NULL,
    type          TEXT NOT NULL
                  CHECK (type IN ('confirmed', 'needs_validation', 'next_step')),
    content       TEXT NOT NULL,
    order_index   INTEGER NOT NULL DEFAULT 0,
    created_at    DATETIME NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
);

CREATE INDEX idx_stage_items_stage ON stage_items(stage_id);
CREATE INDEX idx_stage_items_type ON stage_items(type);

-- --------------------------------------------------------
-- Table: messages
-- --------------------------------------------------------
CREATE TABLE messages (
    id              TEXT PRIMARY KEY,
    project_id      TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content         TEXT NOT NULL,
    structured_data TEXT,                     -- JSON string for SQLite
    timestamp       DATETIME NOT NULL DEFAULT (datetime('now')),
    turn_number     INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_project ON messages(project_id);
CREATE INDEX idx_messages_turn ON messages(project_id, turn_number);

-- --------------------------------------------------------
-- Table: blueprints
-- --------------------------------------------------------
CREATE TABLE blueprints (
    id            TEXT PRIMARY KEY,
    project_id    TEXT NOT NULL UNIQUE,
    content       TEXT NOT NULL,              -- JSON string for SQLite
    generated_at  DATETIME NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Trigger: Auto-update timestamps
-- --------------------------------------------------------
CREATE TRIGGER trg_projects_updated_at
AFTER UPDATE ON projects
BEGIN
    UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER trg_stages_updated_at
AFTER UPDATE ON stages
BEGIN
    UPDATE stages SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER trg_canvases_updated_at
AFTER UPDATE ON canvases
BEGIN
    UPDATE canvases SET updated_at = datetime('now') WHERE id = NEW.id;
END;
```

---

## 5. JSON Structures

### 5.1 structured_data (messages table)

Stored as JSON string in SQLite, JSONB in PostgreSQL.

```json
{
  "updates": {
    "idea": {
      "action": "replace",
      "status": "complete",
      "summary": "Student Record System"
    },
    "user": {
      "action": "replace",
      "status": "complete",
      "summary": "Elementary School Teachers"
    }
  },
  "impact": {
    "affected_stages": [
      {
        "stage": "workflow",
        "reason": "user_changed",
        "action": "needs_review"
      }
    ]
  },
  "missing_stages": ["workflow", "root_cause"],
  "confidence_delta": {
    "idea": 85,
    "user": 80
  }
}
```

### 5.2 content (blueprints table)

```json
{
  "project_name": "EduRecord",
  "problem_statement": "Teachers spend 40% of class time on repetitive administrative tasks.",
  "primary_user": "Elementary school teachers in Indonesia",
  "workflow": "Manual attendance → Paper gradebook → Excel summary → Report to principal",
  "core_pain_point": "Repetitive administrative work consuming teaching time",
  "root_cause": "No centralized digital system for student data management",
  "key_evidence": [
    "Teacher interview: 3 hours/day on admin tasks",
    "School survey: 78% teachers want digital solution"
  ],
  "opportunity": "Digital attendance + grade management for elementary schools",
  "decision": "Build mobile-first student record app for teachers",
  "mvp_scope": [
    "Digital attendance with QR scan",
    "Grade input with subject categories",
    "Auto-generated report PDF"
  ],
  "next_validation": [
    "Interview 5 elementary teachers",
    "Test prototype with 1 school"
  ],
  "reasoning_summary": "Selected based on high evidence availability and clear user segment.",
  "confidence_overall": 82
}
```

---

## 6. Data Integrity Rules

| Rule | Enforcement | Level |
|------|-------------|-------|
| One canvas per project | `UNIQUE` on `canvases.project_id` | Database |
| One blueprint per project | `UNIQUE` on `blueprints.project_id` | Database |
| Exactly 10 stages per canvas | Application logic (seed on canvas creation) | Application |
| Stage names are fixed enum | `CHECK` constraint on `stages.name` | Database |
| Stage status valid values | `CHECK` constraint on `stages.status` | Database |
| Confidence 0-100 | `CHECK` constraint on `stages.confidence` | Database |
| Order index 0-9 | `CHECK` constraint on `stages.order_index` | Database |
| Item type valid values | `CHECK` constraint on `stage_items.type` | Database |
| Role valid values | `CHECK` constraint on `messages.role` | Database |
| Cascade delete | `ON DELETE CASCADE` on all FKs | Database |
| Auto timestamp update | Triggers on projects, stages, canvases | Database |

---

## 7. Query Patterns

### 7.1 Load Full Project
```sql
SELECT p.*, c.id as canvas_id
FROM projects p
LEFT JOIN canvases c ON c.project_id = p.id
WHERE p.id = ?;
```

### 7.2 Load Canvas with Stages and Items
```sql
SELECT 
    s.id, s.name, s.status, s.summary, s.confidence, s.order_index,
    si.id as item_id, si.type, si.content, si.order_index as item_order
FROM stages s
LEFT JOIN stage_items si ON si.stage_id = s.id
WHERE s.canvas_id = ?
ORDER BY s.order_index, si.type, si.order_index;
```

### 7.3 Load Chat History
```sql
SELECT id, role, content, structured_data, timestamp, turn_number
FROM messages
WHERE project_id = ?
ORDER BY turn_number ASC, timestamp ASC;
```

### 7.4 Check Completion Status
```sql
SELECT 
    COUNT(CASE WHEN status = 'complete' THEN 1 END) as complete_count,
    COUNT(CASE WHEN status = 'needs_review' THEN 1 END) as review_count,
    COUNT(*) as total_count
FROM stages
WHERE canvas_id = ?;
```

### 7.5 Get Projects List
```sql
SELECT id, name, status, created_at, updated_at
FROM projects
ORDER BY updated_at DESC;
```

---

## 8. Migration Path

| Version | Change | Script |
|---------|--------|--------|
| v0.1.0 | Initial schema | Schema as defined in Section 4 |
| v0.2.0 | Add message.structured_data | `ALTER TABLE messages ADD COLUMN structured_data TEXT;` |
| v0.3.0 | Add stage.confidence | `ALTER TABLE stages ADD COLUMN confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100);` |

---

## 9. Entity Cardinality Summary

| Parent | Child | Cardinality | Cascade |
|--------|-------|-------------|---------|
| PROJECT | CANVAS | 1:1 | DELETE |
| PROJECT | MESSAGE | 1:N | DELETE |
| PROJECT | BLUEPRINT | 1:0..1 | DELETE |
| CANVAS | STAGE | 1:10 (fixed) | DELETE |
| STAGE | STAGE_ITEM | 1:N | DELETE |