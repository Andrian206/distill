-- Migration 003: Add Contradiction Tracking
-- Date: 2026-07-29
-- Purpose: Track user corrections and contradictions
-- Reference: docs/11-ai-reasoning-engine.md §Contradiction Engine

-- Add contradictions column to stages
-- Stores JSON array of contradiction objects
-- Format: [{ stage, old_summary, new_info, detected_at, reason }]
ALTER TABLE stages
ADD COLUMN contradictions TEXT;

-- Migration complete
-- This enables the Contradiction Engine to:
-- 1. Detect when user corrects previous statements
-- 2. Set stage status to 'needs_review'
-- 3. Reduce confidence by 20%
-- 4. Track contradiction history

-- Made with Bob
