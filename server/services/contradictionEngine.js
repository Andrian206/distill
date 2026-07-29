/**
 * Contradiction Engine
 * Detects and handles contradictions in user statements
 */

import { canvasDb } from '../db.js';

/**
 * Detect contradiction between new info and existing stage
 * @param {string} newInfo - New information from user
 * @param {object} existingStage - Existing stage object
 * @returns {object|null} Contradiction object or null
 */
export function detectContradiction(newInfo, existingStage) {
    if (!existingStage || !existingStage.summary) return null;

    // Only check for contradictions in completed stages
    if (existingStage.status !== 'complete') return null;

    // Contradiction keywords (multilingual)
    const contradictionKeywords = [
        // Indonesian
        'bukan',
        'tidak',
        'salah',
        'sebenarnya',
        'keliru',
        'kurang tepat',
        // English
        'not',
        'no',
        'wrong',
        'actually',
        'incorrect',
        'rather',
        'instead',
        // Correction phrases
        'maksud saya',
        'yang saya maksud',
        'lebih tepatnya',
        'i mean',
        'what i meant',
        'more precisely',
    ];

    const newInfoLower = newInfo.toLowerCase();
    const hasContradictionKeyword = contradictionKeywords.some(keyword =>
        newInfoLower.includes(keyword)
    );

    if (hasContradictionKeyword) {
        return {
            stage: existingStage.name,
            old_summary: existingStage.summary,
            new_info: newInfo,
            detected_at: new Date().toISOString(),
            reason: 'user_correction',
        };
    }

    return null;
}

/**
 * Handle contradiction by updating stage status
 * @param {string} stageId - Stage ID
 * @param {object} contradiction - Contradiction object
 * @returns {object} Update result
 */
export function handleContradiction(stageId, contradiction) {
    // Get current stage
    const stage = canvasDb.getStageById(stageId);
    if (!stage) {
        return { error: 'Stage not found' };
    }

    // Parse existing contradictions
    let contradictions = [];
    if (stage.contradictions) {
        try {
            contradictions = JSON.parse(stage.contradictions);
        } catch (e) {
            contradictions = [];
        }
    }

    // Add new contradiction
    contradictions.push(contradiction);

    // Update stage: set to needs_review and reduce confidence
    const newConfidence = Math.max(0, (stage.confidence || 0) - 20);

    canvasDb.updateStage(stageId, {
        status: 'needs_review',
        confidence: newConfidence,
        contradictions: JSON.stringify(contradictions),
    });

    return {
        stage: stage.name,
        action: 'needs_review',
        reason: 'contradiction_detected',
        old_confidence: stage.confidence,
        new_confidence: newConfidence,
        contradiction_count: contradictions.length,
    };
}

/**
 * Resolve contradiction (clear contradictions and restore status)
 * @param {string} stageId - Stage ID
 * @returns {object} Update result
 */
export function resolveContradiction(stageId) {
    canvasDb.updateStage(stageId, {
        status: 'partial',
        contradictions: JSON.stringify([]),
    });

    return {
        resolved: true,
        new_status: 'partial',
    };
}

/**
 * Get all contradictions for a canvas
 * @param {string} canvasId - Canvas ID
 * @returns {array} Array of contradictions
 */
export function getCanvasContradictions(canvasId) {
    const stages = canvasDb.getStagesByCanvasId(canvasId);
    const allContradictions = [];

    stages.forEach(stage => {
        if (stage.contradictions) {
            try {
                const contradictions = JSON.parse(stage.contradictions);
                contradictions.forEach(c => {
                    allContradictions.push({
                        ...c,
                        stage_name: stage.name,
                        stage_id: stage.id,
                    });
                });
            } catch (e) {
                // Skip invalid JSON
            }
        }
    });

    return allContradictions;
}

/**
 * Check if message contains correction intent
 * @param {string} message - User message
 * @returns {boolean} True if correction detected
 */
export function isCorrectionMessage(message) {
    const correctionPatterns = [
        /bukan.*tapi/i,
        /tidak.*melainkan/i,
        /salah.*sebenarnya/i,
        /not.*but/i,
        /not.*rather/i,
        /actually.*is/i,
        /maksud saya/i,
        /yang saya maksud/i,
        /i mean/i,
        /what i meant/i,
    ];

    return correctionPatterns.some(pattern => pattern.test(message));
}

export default {
    detectContradiction,
    handleContradiction,
    resolveContradiction,
    getCanvasContradictions,
    isCorrectionMessage,
};

// Made with Bob