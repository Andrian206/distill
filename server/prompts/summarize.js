/**
 * Prompt for conversation summarization
 * Triggered every 50 messages to compress context
 * Preserves: decisions, canvas changes, user insights
 */

export default function buildSummarizationPrompt(messages, canvasState) {
    // Detect user's language from messages
    const userMessages = messages.filter(m => m.role === 'user');
    const sampleText = userMessages.slice(0, 5).map(m => m.content).join(' ');

    // Simple language detection: check for Indonesian words
    const indonesianWords = ['saya', 'yang', 'untuk', 'dengan', 'adalah', 'ini', 'itu', 'dan', 'atau', 'tidak'];
    const hasIndonesian = indonesianWords.some(word =>
        sampleText.toLowerCase().includes(word)
    );
    const detectedLanguage = hasIndonesian ? 'Indonesian' : 'English';

    const messageHistory = messages.map((msg, idx) =>
        `[${idx + 1}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');

    return `# TASK: Conversation Summarization

**CRITICAL: You MUST write the entire summary in ${detectedLanguage} language.**
**If the user writes in Indonesian, your summary MUST be in Indonesian.**
**If the user writes in English, your summary MUST be in English.**

You are summarizing a discovery conversation between a user and an AI assistant about their project idea.

## CONVERSATION HISTORY (Messages 1-${messages.length})

${messageHistory}

## CURRENT CANVAS STATE

${JSON.stringify(canvasState, null, 2)}

## SUMMARIZATION INSTRUCTIONS

Create a COMPREHENSIVE summary that preserves ALL critical information:

### 1. PROJECT OVERVIEW
- What is the user trying to build?
- Who is the target user/audience?
- What problem are they solving?

### 2. KEY DECISIONS MADE
- List ALL important decisions the user has made
- Include rationale if mentioned
- Note any changes in direction

### 3. CANVAS EVOLUTION
- What stages have been filled?
- What information was added to each stage?
- What insights emerged during the conversation?

### 4. USER INSIGHTS & CONTEXT
- Important background information shared by user
- User's expertise, constraints, or preferences
- Domain-specific knowledge revealed
- Any personal context that shapes the project

### 5. OPEN QUESTIONS & AREAS TO EXPLORE
- What questions remain unanswered?
- What areas need more exploration and deeper investigation?
- What assumptions need to be validated?
- What topics were mentioned but not fully explored?
- What was the last topic being discussed?

### 6. CONVERSATION DYNAMICS
- User's communication style and language preference
- Topics that excited or concerned the user
- Any recurring themes or patterns

## OUTPUT FORMAT

**IMPORTANT: Write the ENTIRE summary in ${detectedLanguage}. Match the user's language exactly.**

Provide a structured summary in the following format (use ${detectedLanguage} language):

**PROJECT:** [One-line project description]

**TARGET USER:** [Who is this for?]

**PROBLEM:** [What problem does it solve?]

**KEY DECISIONS:**
- [Decision 1]
- [Decision 2]
- [etc.]

**CANVAS PROGRESS:**
- Idea: [summary of what's in this stage]
- User: [summary]
- Workflow: [summary]
- Pain Point: [summary]
- Root Cause: [summary]
- Assumption: [summary]
- Evidence: [summary]
- Opportunity: [summary]
- Decision: [summary]
- MVP: [summary]

**USER INSIGHTS:**
- [Insight 1]
- [Insight 2]
- [etc.]

**AREAS TO EXPLORE:**
- [Area 1 that needs deeper investigation]
- [Area 2 that was mentioned but not fully explored]
- [etc.]

**OPEN QUESTIONS:**
- [Question 1]
- [Question 2]
- [etc.]

**LAST DISCUSSED:** [What was the most recent topic?]

**LANGUAGE:** [User's preferred language - Indonesian/English/etc.]

---

Generate the summary now. Be thorough and preserve ALL important details.
`;
}

// Made with Bob
