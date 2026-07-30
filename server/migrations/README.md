# Database Migrations

This folder contains all database migration scripts for Distill.

## Migration System

Migrations are automatically executed on server startup via `server/db.js`.

The system checks for missing columns and adds them if needed.

## Migration History

### Version 1: Initial Schema (Built-in)
**Date:** 2026-07-29
**Status:** ✅ Complete

Tables created:
- `projects` - Project metadata
- `canvases` - Canvas state (1:1 with projects)
- `stages` - 10 discovery stages per canvas
- `stage_items` - Items within each stage (confirmed, needs_validation, next_step)
- `messages` - Chat history
- `blueprints` - Generated project blueprints

### Version 2: Evidence Tracking
**Date:** 2026-07-29
**Status:** ✅ Complete
**File:** `002_add_evidence_tracking.sql`

Added columns to `stage_items`:
- `evidence_type` - Classification: explicit, observational, experiential, assumption
- `confidence_boost` - Confidence contribution (0-20)

**Purpose:** Enable evidence-based confidence calculation per docs/11 §Evidence Classification

**Impact:** Core feature for Confidence Engine

### Version 3: Contradiction Tracking
**Date:** 2026-07-29
**Status:** ✅ Complete
**File:** `003_add_contradictions.sql`

Added column to `stages`:
- `contradictions` - JSON array of contradiction objects

**Purpose:** Track user corrections and contradictions per docs/11 §Contradiction Engine

**Impact:** Core feature for handling user revisions

## How Migrations Work

1. **Automatic Detection**: On startup, `runMigrations()` checks for missing columns
2. **Safe Execution**: Uses `PRAGMA table_info()` to detect existing columns
3. **Idempotent**: Can run multiple times safely (checks before adding)
4. **No Rollback**: Migrations are additive only (no data loss)

## Adding New Migrations

1. Create SQL file in this folder: `00X_description.sql`
2. Add migration logic to `server/db.js` `runMigrations()` function
3. Update this README with migration details
4. Test on clean database

## Migration Code Location

All migration logic is in: `server/db.js` lines 132-177

```javascript
function runMigrations() {
  // Check existing columns using PRAGMA table_info()
  // Add missing columns with ALTER TABLE
  // Log migration status
}
```

## Current Schema Status

✅ All core features implemented:
- Evidence classification system
- Confidence calculation engine
- Contradiction tracking
- Stage lock mechanism
- Progress tracking

## Verification

To verify migrations:
```bash
sqlite3 /tmp/distill.db ".schema"
```

To check specific table:
```bash
sqlite3 /tmp/distill.db "PRAGMA table_info(stage_items);"
```

To check if migrations ran:
```bash
sqlite3 /tmp/distill.db "SELECT name FROM sqlite_master WHERE type='table';"
```

## Notes

- Domain detection is NOT implemented (not needed for first-time builders MVP)
- All migrations are backward compatible
- Database is session-only (in /tmp/) for MVP
- No authentication/multi-user support in MVP