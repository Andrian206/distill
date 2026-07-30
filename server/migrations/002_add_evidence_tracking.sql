-- Migration 002: Add Evidence Tracking
-- Date: 2026-07-29
-- Purpose: Enable evidence-based confidence calculation
-- Reference: docs/11-ai-reasoning-engine.md §Evidence Classification

-- Add evidence_type column to stage_items
-- Values: explicit, observational, experiential, assumption
ALTER TABLE stage_items
ADD COLUMN evidence_type TEXT
CHECK (evidence_type IS NULL OR evidence_type IN ('explicit', 'observational', 'experiential', 'assumption'));

-- Add confidence_boost column to stage_items
-- Range: 0-20 (explicit=20, observational=15, experiential=10, assumption=5)
ALTER TABLE stage_items
ADD COLUMN confidence_boost INTEGER DEFAULT 0
CHECK (confidence_boost >= 0 AND confidence_boost <= 20);

-- Create index for evidence_type queries
CREATE INDEX IF NOT EXISTS idx_stage_items_evidence_type ON stage_items(evidence_type);

-- Migration complete
-- This enables the Confidence Engine to calculate scores based on evidence quality

-- Made with Bob
