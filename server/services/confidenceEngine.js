/**
 * Confidence Engine
 * Calculates confidence scores based on evidence, consistency, completeness, and evidence type
 * Formula: (evidence*0.3 + consistency*0.3 + completeness*0.2 + evidenceType*0.2) * 100
 */

/**
 * Calculate confidence for a stage
 * @param {object} stage - Stage object with items, summary, contradictions
 * @returns {number} Confidence score (0-100)
 */
export function calculateStageConfidence(stage) {
    if (!stage) return 0;

    const evidenceScore = calculateEvidenceScore(stage.items || []);
    const consistencyScore = calculateConsistencyScore(stage);
    const completenessScore = calculateCompletenessScore(stage);
    const evidenceTypeScore = calculateEvidenceTypeScore(stage.items || []);

    const confidence = Math.round(
        (evidenceScore * 0.3 +
            consistencyScore * 0.3 +
            completenessScore * 0.2 +
            evidenceTypeScore * 0.2) *
        100
    );

    return Math.min(100, Math.max(0, confidence));
}

/**
 * Calculate overall canvas confidence (average of all stages)
 * @param {array} stages - Array of stage objects
 * @returns {number} Overall confidence (0-100)
 */
export function calculateCanvasConfidence(stages) {
    if (!stages || stages.length === 0) return 0;

    const sum = stages.reduce((acc, stage) => {
        const confidence = stage.confidence !== null && stage.confidence !== undefined
            ? stage.confidence
            : 0;
        return acc + confidence;
    }, 0);

    return Math.round(sum / stages.length);
}

/**
 * Calculate evidence score based on number of confirmed items
 * @param {array} items - Stage items
 * @returns {number} Score (0-1)
 */
function calculateEvidenceScore(items) {
    const confirmedItems = items.filter(item => item.type === 'confirmed');
    const evidenceCount = confirmedItems.length;

    if (evidenceCount === 0) return 0;
    if (evidenceCount === 1) return 0.4;
    if (evidenceCount === 2) return 0.6;
    if (evidenceCount >= 3) return Math.min(1.0, 0.7 + ((evidenceCount - 3) * 0.1));

    return 0;
}

/**
 * Calculate consistency score based on contradictions
 * @param {object} stage - Stage object
 * @returns {number} Score (0-1)
 */
function calculateConsistencyScore(stage) {
    if (!stage.contradictions) return 1.0;

    let contradictions = [];
    try {
        contradictions = typeof stage.contradictions === 'string'
            ? JSON.parse(stage.contradictions)
            : stage.contradictions;
    } catch (e) {
        contradictions = [];
    }

    if (!Array.isArray(contradictions) || contradictions.length === 0) {
        return 1.0;
    }

    // Each contradiction reduces score by 20%
    return Math.max(0, 1.0 - (contradictions.length * 0.2));
}

/**
 * Calculate completeness score based on summary and items
 * @param {object} stage - Stage object
 * @returns {number} Score (0-1)
 */
function calculateCompletenessScore(stage) {
    const hasConfirmed = stage.items && stage.items.some(item => item.type === 'confirmed');
    const hasSummary = stage.summary && stage.summary.length > 0;

    if (hasConfirmed && hasSummary) return 1.0;
    if (hasConfirmed || hasSummary) return 0.5;
    return 0;
}

/**
 * Calculate evidence type score based on evidence quality
 * @param {array} items - Stage items
 * @returns {number} Score (0-1)
 */
function calculateEvidenceTypeScore(items) {
    const confirmedItems = items.filter(item => item.type === 'confirmed');

    if (confirmedItems.length === 0) return 0;

    const typeBoosts = {
        explicit: 0.20,
        observational: 0.15,
        experiential: 0.10,
        assumption: 0.05,
    };

    // Calculate average boost from evidence types
    const totalBoost = confirmedItems.reduce((sum, item) => {
        const boost = item.evidence_type ? (typeBoosts[item.evidence_type] || 0) : 0.10; // Default to experiential
        return sum + boost;
    }, 0);

    const avgBoost = totalBoost / confirmedItems.length;

    // Normalize to 0-1 (max boost is 0.20 for explicit)
    return avgBoost / 0.20;
}

/**
 * Determine stage status based on confidence
 * @param {number} confidence - Confidence score (0-100)
 * @param {string} currentStatus - Current stage status
 * @returns {string} Suggested status
 */
export function determineStageStatus(confidence, currentStatus) {
    if (confidence === 0) return 'not_started';
    if (confidence >= 80) return 'complete';
    if (confidence >= 50) return 'partial';
    if (currentStatus === 'needs_review') return 'needs_review';
    return 'partial';
}

/**
 * Get confidence level label
 * @param {number} confidence - Confidence score (0-100)
 * @returns {object} Level info
 */
export function getConfidenceLevel(confidence) {
    if (confidence >= 80) {
        return { level: 'high', label: 'High', color: 'green' };
    }
    if (confidence >= 50) {
        return { level: 'medium', label: 'Medium', color: 'yellow' };
    }
    return { level: 'low', label: 'Low', color: 'red' };
}

/**
 * Calculate confidence boost from evidence type
 * @param {string} evidenceType - Type of evidence
 * @returns {number} Confidence boost (0-20)
 */
export function getConfidenceBoost(evidenceType) {
    const boosts = {
        explicit: 20,
        observational: 15,
        experiential: 10,
        assumption: 5,
    };

    return boosts[evidenceType] || 0;
}

export default {
    calculateStageConfidence,
    calculateCanvasConfidence,
    determineStageStatus,
    getConfidenceLevel,
    getConfidenceBoost,
};

// Made with Bob