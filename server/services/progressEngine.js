/**
 * Progress Engine
 * Tracks conversation progress and detects stagnation
 */

/**
 * Detect progress between two states
 * @param {object} previousState - Previous stage state
 * @param {object} currentState - Current stage state
 * @returns {object} Progress indicators
 */
export function detectProgress(previousState, currentState) {
    const progress = {
        hasProgress: false,
        indicators: [],
        score: 0,
    };

    if (!previousState || !currentState) {
        return progress;
    }

    // Check confidence change
    const confidenceDelta = (currentState.confidence || 0) - (previousState.confidence || 0);
    if (confidenceDelta > 0) {
        progress.hasProgress = true;
        progress.score += confidenceDelta;
        progress.indicators.push({
            type: 'confidence_increase',
            delta: confidenceDelta,
            from: previousState.confidence,
            to: currentState.confidence,
        });
    } else if (confidenceDelta < 0) {
        progress.indicators.push({
            type: 'confidence_decrease',
            delta: confidenceDelta,
            from: previousState.confidence,
            to: currentState.confidence,
        });
    }

    // Check new evidence
    const previousEvidenceCount = previousState.items
        ? previousState.items.filter(i => i.type === 'confirmed').length
        : 0;
    const currentEvidenceCount = currentState.items
        ? currentState.items.filter(i => i.type === 'confirmed').length
        : 0;
    const newEvidenceCount = currentEvidenceCount - previousEvidenceCount;

    if (newEvidenceCount > 0) {
        progress.hasProgress = true;
        progress.score += newEvidenceCount * 10;
        progress.indicators.push({
            type: 'new_evidence',
            count: newEvidenceCount,
            total: currentEvidenceCount,
        });
    }

    // Check status change
    if (currentState.status !== previousState.status) {
        progress.hasProgress = true;
        progress.score += 20;
        progress.indicators.push({
            type: 'status_change',
            from: previousState.status,
            to: currentState.status,
        });
    }

    // Check summary update
    if (currentState.summary !== previousState.summary && currentState.summary) {
        progress.hasProgress = true;
        progress.score += 15;
        progress.indicators.push({
            type: 'summary_updated',
            hasNewSummary: true,
        });
    }

    return progress;
}

/**
 * Detect stagnation (no progress in recent turns)
 * @param {array} recentProgress - Array of recent progress objects
 * @param {number} threshold - Number of turns without progress to consider stagnant
 * @returns {object} Stagnation info
 */
export function detectStagnation(recentProgress, threshold = 3) {
    if (!recentProgress || recentProgress.length < threshold) {
        return {
            isStagnant: false,
            noProgressTurns: 0,
            recommendation: 'continue',
        };
    }

    // Count consecutive turns without progress
    let noProgressCount = 0;
    for (let i = recentProgress.length - 1; i >= 0; i--) {
        if (!recentProgress[i].hasProgress) {
            noProgressCount++;
        } else {
            break; // Stop at first progress
        }
    }

    const isStagnant = noProgressCount >= threshold;

    return {
        isStagnant,
        noProgressTurns: noProgressCount,
        recommendation: isStagnant ? 'change_strategy' : 'continue',
        suggestions: isStagnant
            ? [
                'Switch to reflection mode',
                'Ask a different type of question',
                'Challenge current assumptions',
                'Move to next stage',
            ]
            : [],
    };
}

/**
 * Calculate overall progress score for a canvas
 * @param {object} canvas - Canvas state
 * @returns {object} Progress score
 */
export function calculateOverallProgress(canvas) {
    if (!canvas || !canvas.stages) {
        return {
            score: 0,
            percentage: 0,
            completedStages: 0,
            totalStages: 10,
        };
    }

    const totalStages = canvas.stages.length;
    const completedStages = canvas.stages.filter(s => s.status === 'complete').length;
    const partialStages = canvas.stages.filter(s => s.status === 'partial').length;

    // Score: complete = 100%, partial = 50%, not_started = 0%
    const score =
        completedStages * 100 + partialStages * 50 + canvas.stages.filter(s => s.status === 'not_started').length * 0;

    const percentage = Math.round((score / (totalStages * 100)) * 100);

    return {
        score,
        percentage,
        completedStages,
        partialStages,
        totalStages,
        isComplete: completedStages === totalStages,
    };
}

/**
 * Track progress history
 * @param {string} projectId - Project ID
 * @param {object} progressData - Progress data to track
 * @returns {object} Tracked progress
 */
export function trackProgress(projectId, progressData) {
    // In-memory tracking (could be persisted to DB if needed)
    if (!global.progressHistory) {
        global.progressHistory = {};
    }

    if (!global.progressHistory[projectId]) {
        global.progressHistory[projectId] = [];
    }

    const entry = {
        ...progressData,
        timestamp: new Date().toISOString(),
    };

    global.progressHistory[projectId].push(entry);

    // Keep only last 20 entries
    if (global.progressHistory[projectId].length > 20) {
        global.progressHistory[projectId] = global.progressHistory[projectId].slice(-20);
    }

    return entry;
}

/**
 * Get progress history for a project
 * @param {string} projectId - Project ID
 * @returns {array} Progress history
 */
export function getProgressHistory(projectId) {
    if (!global.progressHistory || !global.progressHistory[projectId]) {
        return [];
    }

    return global.progressHistory[projectId];
}

/**
 * Analyze progress trend
 * @param {array} progressHistory - Progress history
 * @returns {object} Trend analysis
 */
export function analyzeProgressTrend(progressHistory) {
    if (!progressHistory || progressHistory.length < 3) {
        return {
            trend: 'insufficient_data',
            direction: 'neutral',
            velocity: 0,
        };
    }

    // Calculate average progress score over time
    const recentScores = progressHistory.slice(-5).map(p => p.score || 0);
    const avgRecentScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    const olderScores = progressHistory.slice(-10, -5).map(p => p.score || 0);
    const avgOlderScore = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 0;

    const velocity = avgRecentScore - avgOlderScore;

    let trend = 'stable';
    let direction = 'neutral';

    if (velocity > 10) {
        trend = 'accelerating';
        direction = 'positive';
    } else if (velocity < -10) {
        trend = 'decelerating';
        direction = 'negative';
    }

    return {
        trend,
        direction,
        velocity: Math.round(velocity),
        avgRecentScore: Math.round(avgRecentScore),
        avgOlderScore: Math.round(avgOlderScore),
    };
}

export default {
    detectProgress,
    detectStagnation,
    calculateOverallProgress,
    trackProgress,
    getProgressHistory,
    analyzeProgressTrend,
};

// Made with Bob