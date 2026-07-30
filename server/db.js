import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const DB_PATH = process.env.DB_PATH || '/tmp/distill.db';
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Run migrations first
  runMigrations();

  // Create tables
  db.exec(`
    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Untitled Project',
      status TEXT NOT NULL DEFAULT 'discovering'
        CHECK (status IN ('discovering', 'distilling', 'validating', 'completed')),
      domain TEXT DEFAULT 'general'
        CHECK (domain IN ('general', 'enterprise', 'startup', 'research', 'community')),
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

    -- Canvases table
    CREATE TABLE IF NOT EXISTS canvases (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL UNIQUE,
      updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Stages table
    CREATE TABLE IF NOT EXISTS stages (
      id TEXT PRIMARY KEY,
      canvas_id TEXT NOT NULL,
      name TEXT NOT NULL
        CHECK (name IN (
          'idea', 'user', 'workflow', 'pain_point',
          'root_cause', 'assumption', 'evidence',
          'opportunity', 'decision', 'mvp'
        )),
      status TEXT NOT NULL DEFAULT 'not_started'
        CHECK (status IN ('not_started', 'partial', 'complete', 'needs_review')),
      summary TEXT,
      confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
      contradictions TEXT, -- JSON array of contradiction objects
      order_index INTEGER NOT NULL CHECK (order_index >= 0 AND order_index <= 9),
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (canvas_id) REFERENCES canvases(id) ON DELETE CASCADE,
      UNIQUE (canvas_id, name)
    );

    CREATE INDEX IF NOT EXISTS idx_stages_canvas ON stages(canvas_id);
    CREATE INDEX IF NOT EXISTS idx_stages_status ON stages(status);

    -- Stage items table
    CREATE TABLE IF NOT EXISTS stage_items (
      id TEXT PRIMARY KEY,
      stage_id TEXT NOT NULL,
      type TEXT NOT NULL
        CHECK (type IN ('confirmed', 'needs_validation', 'next_step')),
      content TEXT NOT NULL,
      evidence_type TEXT
        CHECK (evidence_type IS NULL OR evidence_type IN ('explicit', 'observational', 'experiential', 'assumption')),
      confidence_boost INTEGER DEFAULT 0
        CHECK (confidence_boost >= 0 AND confidence_boost <= 20),
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_stage_items_stage ON stage_items(stage_id);
    CREATE INDEX IF NOT EXISTS idx_stage_items_type ON stage_items(type);
    CREATE INDEX IF NOT EXISTS idx_stage_items_evidence_type ON stage_items(evidence_type);

    -- Messages table
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      structured_data TEXT,
      timestamp DATETIME NOT NULL DEFAULT (datetime('now')),
      turn_number INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
    CREATE INDEX IF NOT EXISTS idx_messages_turn ON messages(project_id, turn_number);

    -- Blueprints table
    CREATE TABLE IF NOT EXISTS blueprints (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      generated_at DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Triggers for auto-updating timestamps
    CREATE TRIGGER IF NOT EXISTS trg_projects_updated_at
    AFTER UPDATE ON projects
    BEGIN
      UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_stages_updated_at
    AFTER UPDATE ON stages
    BEGIN
      UPDATE stages SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_canvases_updated_at
    AFTER UPDATE ON canvases
    BEGIN
      UPDATE canvases SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);

  console.log('✅ Database initialized successfully');
}

// Database migrations
function runMigrations() {
  // Check if stage_items table exists and has evidence_type column
  const stageItemsInfo = db.prepare(`PRAGMA table_info(stage_items)`).all();
  const stagesInfo = db.prepare(`PRAGMA table_info(stages)`).all();

  if (stageItemsInfo.length > 0) {
    // Check for evidence_type column
    const hasEvidenceType = stageItemsInfo.some(col => col.name === 'evidence_type');
    const hasConfidenceBoost = stageItemsInfo.some(col => col.name === 'confidence_boost');

    if (!hasEvidenceType) {
      console.log('🔄 Migrating: Adding evidence_type column to stage_items...');
      db.exec(`
        ALTER TABLE stage_items
        ADD COLUMN evidence_type TEXT
        CHECK (evidence_type IS NULL OR evidence_type IN ('explicit', 'observational', 'experiential', 'assumption'))
      `);
      console.log('✅ Migration complete: evidence_type column added');
    }

    if (!hasConfidenceBoost) {
      console.log('🔄 Migrating: Adding confidence_boost column to stage_items...');
      db.exec(`
        ALTER TABLE stage_items
        ADD COLUMN confidence_boost INTEGER DEFAULT 0
        CHECK (confidence_boost >= 0 AND confidence_boost <= 20)
      `);
      console.log('✅ Migration complete: confidence_boost column added');
    }
  }

  // Migrate: Add contradictions column to stages table
  if (stagesInfo.length > 0) {
    const hasContradictions = stagesInfo.some(col => col.name === 'contradictions');
    
    if (!hasContradictions) {
      console.log('🔄 Migrating: Adding contradictions column to stages table...');
      db.exec(`
        ALTER TABLE stages
        ADD COLUMN contradictions TEXT
      `);
      console.log('✅ Migration complete: contradictions column added');
    }
  }
}

// Stage definitions with order
const STAGE_DEFINITIONS = [
  { name: 'idea', order: 0, icon: '💡', label: 'Idea' },
  { name: 'user', order: 1, icon: '👤', label: 'User' },
  { name: 'workflow', order: 2, icon: '🔄', label: 'Workflow' },
  { name: 'pain_point', order: 3, icon: '⚠️', label: 'Pain Point' },
  { name: 'root_cause', order: 4, icon: '🌱', label: 'Root Cause' },
  { name: 'assumption', order: 5, icon: '❓', label: 'Assumption' },
  { name: 'evidence', order: 6, icon: '📄', label: 'Evidence' },
  { name: 'opportunity', order: 7, icon: '✨', label: 'Opportunity' },
  { name: 'decision', order: 8, icon: '✅', label: 'Decision' },
  { name: 'mvp', order: 9, icon: '🚀', label: 'MVP' },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parses a JSON field from database result
 * @param {string|null} value - JSON string or null
 * @returns {any|null} Parsed object or null/empty array
 */
function parseJsonField(value) {
  if (!value) {
    return Array.isArray(value) ? [] : null;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('❌ JSON parse error:', error);
    return null;
  }
}

// ============================================================================
// Database Query Helpers
// ============================================================================

/**
 * Execute a query and return all results
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {array} Query results
 */
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Execute a query and return single result
 * @param {string} sql - SQL query
 * @param {array} params - Query parameters
 * @returns {object|null} Single result or null
 */
function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

// ============================================================================
// Project CRUD Operations
// ============================================================================

export const projectDb = {
  /**
   * Creates a new project with canvas and 10 stages
   * @param {string} name - Project name
   * @returns {object} Created project with canvas
   */
  create(name = 'Untitled Project') {
    const projectId = randomUUID();
    const canvasId = randomUUID();

    const insertProject = db.prepare(`
      INSERT INTO projects (id, name, status)
      VALUES (?, ?, 'discovering')
    `);

    const insertCanvas = db.prepare(`
      INSERT INTO canvases (id, project_id)
      VALUES (?, ?)
    `);

    const insertStage = db.prepare(`
      INSERT INTO stages (id, canvas_id, name, status, order_index)
      VALUES (?, ?, ?, 'not_started', ?)
    `);

    // Transaction to create project, canvas, and 10 stages
    const transaction = db.transaction(() => {
      insertProject.run(projectId, name);
      insertCanvas.run(canvasId, projectId);

      // Create 10 stages
      STAGE_DEFINITIONS.forEach((stage) => {
        const stageId = randomUUID();
        insertStage.run(stageId, canvasId, stage.name, stage.order);
      });
    });

    transaction();

    return { id: projectId, name, status: 'discovering', canvas_id: canvasId };
  },

  /**
   * Retrieves a project by ID with its canvas and stages
   * @param {string} projectId - Project ID
   * @returns {object|null} Project object with canvas and stages, or null if not found
   */
  getById(projectId) {
    return buildProjectWithCanvas(projectId);
  },

  getAll() {
    return db.prepare(`
      SELECT id, name, status, created_at, updated_at
      FROM projects
      ORDER BY updated_at DESC
    `).all();
  },

  delete(projectId) {
    return db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
  },

  /**
   * Updates project status
   * @param {string} projectId - Project ID
   * @param {string} status - New status (discovering|distilling|validating|completed)
   * @returns {object} Database result
   */
  updateStatus(projectId, status) {
    return db.prepare(`
      UPDATE projects SET status = ? WHERE id = ?
    `).run(status, projectId);
  },
};

// ============================================================================
// Project Helper Functions (Internal)
// ============================================================================

/**
 * Retrieves project and canvas data
 * @param {string} projectId - Project ID
 * @returns {object|null} Project with canvas_id, or null if not found
 * @private
 */
function getProjectWithCanvas(projectId) {
  return queryOne(`
    SELECT p.*, c.id as canvas_id
    FROM projects p
    LEFT JOIN canvases c ON c.project_id = p.id
    WHERE p.id = ?
  `, [projectId]);
}

/**
 * Retrieves stages with their items for a canvas
 * @param {string} canvasId - Canvas ID
 * @returns {array} Array of stage objects with parsed items
 * @private
 */
function getStagesWithItems(canvasId) {
  const stages = query(`
    SELECT s.*,
      (SELECT json_group_array(
        json_object(
          'id', si.id,
          'type', si.type,
          'content', si.content,
          'order_index', si.order_index,
          'evidence_type', si.evidence_type,
          'confidence_boost', si.confidence_boost
        )
      ) FROM stage_items si WHERE si.stage_id = s.id) as items
    FROM stages s
    WHERE s.canvas_id = ?
    ORDER BY s.order_index
  `, [canvasId]);

  // Parse items JSON using utility function
  return stages.map(stage => ({
    ...stage,
    items: parseJsonField(stage.items) || []
  }));
}

/**
 * Builds complete project response object
 * @param {string} projectId - Project ID
 * @returns {object|null} Complete project with canvas and stages, or null if not found
 * @private
 */
function buildProjectWithCanvas(projectId) {
  const project = getProjectWithCanvas(projectId);
  if (!project) return null;

  const stages = getStagesWithItems(project.canvas_id);

  return {
    ...project,
    canvas: {
      id: project.canvas_id,
      stages,
    },
  };
}

// Canvas operations
export const canvasDb = {
  getByProjectId(projectId) {
    return db.prepare(`
      SELECT * FROM canvases WHERE project_id = ?
    `).get(projectId);
  },

  updateStage(stageId, updates) {
    const { status, summary, confidence, contradictions } = updates;
    return db.prepare(`
      UPDATE stages 
      SET status = COALESCE(?, status),
          summary = COALESCE(?, summary),
          confidence = COALESCE(?, confidence),
          contradictions = COALESCE(?, contradictions)
      WHERE id = ?
    `).run(status, summary, confidence, contradictions, stageId);
  },

  getStageByName(canvasId, stageName) {
    return db.prepare(`
      SELECT * FROM stages WHERE canvas_id = ? AND name = ?
    `).get(canvasId, stageName);
  },

  getStageById(stageId) {
    return db.prepare(`
      SELECT * FROM stages WHERE id = ?
    `).get(stageId);
  },

  getStagesByCanvasId(canvasId) {
    return db.prepare(`
      SELECT * FROM stages WHERE canvas_id = ? ORDER BY order_index
    `).all(canvasId);
  },
};

// Stage items operations
export const stageItemDb = {
  create(stageId, type, content, orderIndex = 0, evidenceType = null, confidenceBoost = 0) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO stage_items (id, stage_id, type, content, order_index, evidence_type, confidence_boost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, stageId, type, content, orderIndex, evidenceType, confidenceBoost);
    return {
      id,
      stage_id: stageId,
      type,
      content,
      order_index: orderIndex,
      evidence_type: evidenceType,
      confidence_boost: confidenceBoost
    };
  },

  getByStageId(stageId) {
    return db.prepare(`
      SELECT * FROM stage_items WHERE stage_id = ?
      ORDER BY type, order_index
    `).all(stageId);
  },

  deleteByStageId(stageId) {
    return db.prepare('DELETE FROM stage_items WHERE stage_id = ?').run(stageId);
  },
};

// Message operations
export const messageDb = {
  create(projectId, role, content, structuredData = null, turnNumber) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO messages (id, project_id, role, content, structured_data, turn_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, projectId, role, content, structuredData ? JSON.stringify(structuredData) : null, turnNumber);
    return { id, project_id: projectId, role, content, turn_number: turnNumber };
  },

  /**
   * Retrieves all messages for a project
   * @param {string} projectId - Project ID
   * @returns {array} Array of message objects with parsed structured_data
   */
  getByProjectId(projectId) {
    const messages = query(`
      SELECT * FROM messages WHERE project_id = ?
      ORDER BY turn_number ASC, timestamp ASC
    `, [projectId]);

    // Parse structured_data using utility function
    messages.forEach(msg => {
      if (msg.structured_data) {
        msg.structured_data = parseJsonField(msg.structured_data);
      }
    });

    return messages;
  },

  getLastTurnNumber(projectId) {
    const result = db.prepare(`
      SELECT MAX(turn_number) as max_turn FROM messages WHERE project_id = ?
    `).get(projectId);
    return result.max_turn || 0;
  },
};

// Blueprint operations
export const blueprintDb = {
  /**
   * Creates a new blueprint
   * @param {string} projectId - Project ID
   * @param {object} content - Blueprint content
   * @returns {object} Created blueprint
   */
  create(projectId, content) {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO blueprints (id, project_id, content)
      VALUES (?, ?, ?)
    `).run(id, projectId, JSON.stringify(content));
    return { id, project_id: projectId, content };
  },

  /**
   * Retrieves a blueprint by project ID
   * @param {string} projectId - Project ID
   * @returns {object|null} Blueprint object with parsed content, or null if not found
   */
  getByProjectId(projectId) {
    const blueprint = queryOne(`
      SELECT * FROM blueprints WHERE project_id = ?
    `, [projectId]);

    if (blueprint && blueprint.content) {
      blueprint.content = parseJsonField(blueprint.content);
    }

    return blueprint;
  },
};

// Initialize database on module load
initializeDatabase();

export default db;

// Made with Bob

