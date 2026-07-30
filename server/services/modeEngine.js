/**
 * Mode Engine
 * Selects conversation mode based on context
 * Modes: listening, clarifying, challenging, confirming, transition, reflection
 */

/**
 * Select conversation mode based on context
 * @param {object} context - Context object
 * @returns {string} Selected mode
 */
export function selectConversationMode(context) {
    const {
        stage,
        confidence,
        userMessage,
        messageCount,
        hasContradiction,
        recentMessages = [],
    } = context;

    // Reflection every 5 messages
    if (messageCount > 0 && messageCount % 5 === 0) {
        return 'reflection';
    }

    // User is explaining (long message) - listen
    const userMessageType = detectMessageType(userMessage);
    if (userMessageType === 'explaining') {
        return 'listening';
    }

    // Has contradiction - challenge
    if (hasContradiction) {
        return 'challenging';
    }

    // Low confidence - clarify
    if (confidence < 50) {
        return 'clarifying';
    }

    // High confidence but not complete - confirm
    if (confidence >= 80 && stage.status !== 'complete') {
        return 'confirming';
    }

    // Stage complete - transition
    if (stage.status === 'complete') {
        return 'transition';
    }

    // Check for stagnation (same question pattern)
    if (detectStagnation(recentMessages)) {
        return 'reflection';
    }

    // Default to clarifying
    return 'clarifying';
}

/**
 * Detect user message type
 * @param {string} message - User message
 * @returns {string} Message type
 */
export function detectMessageType(message) {
    if (!message) return 'answering';

    const length = message.length;
    const sentenceCount = (message.match(/[.!?]+/g) || []).length;

    // Long explanation (>200 chars and multiple sentences)
    if (length > 200 && sentenceCount > 2) {
        return 'explaining';
    }

    // Correction keywords
    const correctionKeywords = [
        'bukan',
        'tidak',
        'salah',
        'sebenarnya',
        'not',
        'no',
        'wrong',
        'actually',
    ];
    if (correctionKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return 'correcting';
    }

    // Question
    if (message.trim().endsWith('?')) {
        return 'asking';
    }

    // Default
    return 'answering';
}

/**
 * Get mode-specific prompt instructions
 * @param {string} mode - Conversation mode
 * @returns {string} Instructions for the mode
 */
export function getModeInstructions(mode) {
    const instructions = {
        listening: `Mode: LISTENING
- Acknowledge briefly what user is sharing
- Do NOT interrupt with questions
- Let user continue explaining
- Keep response under 1 sentence
Example: "Saya mendengarkan. Lanjutkan."`,

        clarifying: `Mode: CLARIFYING
- Ask ONE specific question to reduce ambiguity
- Make the question actionable and concrete
- Focus on the most unclear aspect
- Keep response under 3 sentences
Example: "Maksudnya manual seperti apa? Pakai kertas, Excel, atau cara lain?"`,

        challenging: `Mode: CHALLENGING
- Point out specific assumption or contradiction
- Be constructive, not confrontational
- Suggest what to explore or validate
- Keep response under 3 sentences
- **SCOPE CHECK: Is your challenge about adoption, behavior change, or eliminating ALL risks? If yes, STOP — acknowledge it as a noted risk and move on. Engineering reduces probability, not eliminates risk.**
Example: "Anda bilang 'semua guru', tapi tadi Anda juga bilang ada guru senior yang tidak familiar dengan teknologi. Bagaimana Anda yakin mereka juga butuh fitur yang sama?"`,

        confirming: `Mode: CONFIRMING
- Summarize your understanding of the stage
- Ask for confirmation
- Prepare for transition if confirmed
- Keep response under 3 sentences
Example: "Saya rasa kita sudah memahami pain point dengan baik: data entry repetitif yang rawan error. Benar begitu?"`,

        transition: `Mode: TRANSITION
- Acknowledge stage completion
- Introduce next stage naturally
- Explain why next stage is important
- Keep response under 3 sentences
Example: "Baik, sekarang kita sudah paham masalahnya. Mari kita gali lebih dalam: mengapa masalah ini terjadi?"`,

        reflection: `Mode: REFLECTION
- Synthesize key points from recent conversation
- List what is clear and what is not
- Suggest next focus area
- Keep response under 5 sentences
Example: "Saya sudah memahami: ✓ Problem: Data entry repetitif ✓ Workflow: Manual Excel. Masih belum jelas: • Root Cause: Mengapa tidak ada sistem?"`,
    };

    return instructions[mode] || instructions.clarifying;
}

/**
 * Detect stagnation (no progress in recent messages)
 * @param {array} recentMessages - Recent messages
 * @returns {boolean} True if stagnant
 */
function detectStagnation(recentMessages) {
    if (recentMessages.length < 4) return false;

    // Check if AI asked similar questions repeatedly
    const aiMessages = recentMessages
        .filter(m => m.role === 'assistant')
        .slice(-3);

    if (aiMessages.length < 2) return false;

    // Simple check: if last 2 AI messages are very similar
    const lastTwo = aiMessages.slice(-2);
    if (lastTwo.length === 2) {
        const similarity = calculateSimilarity(lastTwo[0].content, lastTwo[1].content);
        if (similarity > 0.7) {
            return true; // Stagnant - asking similar questions
        }
    }

    return false;
}

/**
 * Calculate text similarity (simple word overlap)
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

/**
 * Get mode metadata
 * @param {string} mode - Conversation mode
 * @returns {object} Mode metadata
 */
export function getModeMetadata(mode) {
    const metadata = {
        listening: {
            name: 'Listening',
            icon: '👂',
            description: 'User is explaining, let them continue',
            maxSentences: 1,
        },
        clarifying: {
            name: 'Clarifying',
            icon: '❓',
            description: 'Ask specific question to reduce ambiguity',
            maxSentences: 3,
        },
        challenging: {
            name: 'Challenging',
            icon: '🤔',
            description: 'Point out assumption or contradiction',
            maxSentences: 3,
        },
        confirming: {
            name: 'Confirming',
            icon: '✅',
            description: 'Summarize and confirm understanding',
            maxSentences: 3,
        },
        transition: {
            name: 'Transition',
            icon: '➡️',
            description: 'Move to next stage',
            maxSentences: 3,
        },
        reflection: {
            name: 'Reflection',
            icon: '💭',
            description: 'Synthesize recent conversation',
            maxSentences: 5,
        },
    };

    return metadata[mode] || metadata.clarifying;
}

export default {
    selectConversationMode,
    detectMessageType,
    getModeInstructions,
    getModeMetadata,
};

// Made with Bob