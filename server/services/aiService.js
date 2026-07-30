import { GoogleGenerativeAI } from '@google/generative-ai';
import SYSTEM_PROMPT from '../prompts/system.js';
import buildExtractionPrompt from '../prompts/extract.js';
import buildDistillationPrompt from '../prompts/distill.js';
import buildBlueprintPrompt from '../prompts/blueprint.js';
import buildConversationPrompt from '../prompts/converse.js';
import buildSummarizationPrompt from '../prompts/summarize.js';

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set!');
  console.error('Please set it in your .env file or environment variables.');
  throw new Error('GEMINI_API_KEY is required but not configured');
}

console.log('✅ Gemini API key detected');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================================
// Configuration
// ============================================================================

// Model configuration
const MODEL_NAME = 'gemini-3.1-flash-lite';
const GENERATION_CONFIG = {
  temperature: 0.70,
  topK: 50,
  topP: 0.90,
  maxOutputTokens: 3096,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Error handling wrapper with fallback
 * @param {function} fn - Async function to execute
 * @param {any} fallback - Value to return on error
 * @param {string} errorMessage - Error message prefix
 * @param {string} context - Context for logging
 * @returns {Promise<any>} Result or fallback
 */
async function withFallback(fn, fallback, errorMessage = 'Operation failed', context = 'AI Service') {
  try {
    return await fn();
  } catch (error) {
    console.error(`❌ ${context}: ${errorMessage}`, error);
    return fallback;
  }
}

/**
 * Builds a prompt with system prompt and optional JSON mode
 * @param {string} prompt - User prompt
 * @param {boolean} isJsonMode - Whether to enforce JSON-only response
 * @returns {string} Final prompt ready for AI
 */
function buildPrompt(prompt, isJsonMode = false) {
  const combined = `${SYSTEM_PROMPT}\n\n${prompt}`;
  return isJsonMode
    ? `${combined}\n\nReturn ONLY valid JSON. No markdown. No explanation.`
    : combined;
}

/**
 * Extracts JSON from markdown code block
 * @param {string} text - Response text
 * @returns {object|null} Parsed JSON or null if not found
 * @private
 */
function extractFromCodeBlock(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (!codeBlockMatch) return null;

  const candidate = codeBlockMatch[1].trim();
  try {
    return JSON.parse(candidate);
  } catch (e) {
    return null;
  }
}

/**
 * Extracts balanced JSON from text starting with '{'
 * @param {string} text - Response text
 * @returns {object} Parsed JSON
 * @throws {Error} If no JSON found or unbalanced braces
 * @private
 */
function extractBalancedJSON(text) {
  const startIdx = text.indexOf('{');
  if (startIdx === -1) throw new Error('No JSON object found in response');

  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let endIdx = -1;

  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') depth++;
      if (char === '}') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
  }

  if (endIdx === -1) throw new Error('Unbalanced JSON braces');

  const jsonStr = text.substring(startIdx, endIdx);
  return JSON.parse(jsonStr);
}

/**
 * Extract valid JSON from AI response text
 * Handles: markdown code blocks, trailing text, nested braces, string literals
 * Returns: parsed JSON object or throws
 *
 * @param {string} text - Response text to extract JSON from
 * @returns {object} Parsed JSON object
 * @throws {Error} If no valid JSON can be extracted
 */
function extractJSON(text) {
  if (!text) throw new Error('Empty text for JSON extraction');

  // Strategy 1: Try markdown code block first
  const fromCodeBlock = extractFromCodeBlock(text);
  if (fromCodeBlock) return fromCodeBlock;

  // Strategy 2: Extract balanced JSON
  return extractBalancedJSON(text);
}

/**
 * Call Gemini API with retry logic
 * Docs: "Gemini returns invalid JSON → Retry once"
 */
/**
 * Call Gemini API with retry logic
 * Docs: "Gemini returns invalid JSON → Retry once"
 *
 * @param {string} prompt - User prompt (without system prompt)
 * @param {boolean} isJsonMode - Whether to enforce JSON-only response
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Promise<string>} AI response text
 * @throws {Error} If all retries fail
 */
async function callGemini(prompt, isJsonMode = false, retryCount = 0) {
  const MAX_RETRIES = 1;
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: GENERATION_CONFIG,
  });

  try {
    // Build prompt with system prompt included
    const combinedPrompt = buildPrompt(prompt, isJsonMode);

    const result = await model.generateContent(combinedPrompt);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    // Log raw response for debugging JSON extraction issues
    if (isJsonMode) {
      console.log('📥 Raw extraction response:', text.substring(0, 200));
    }

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error.message);

    // Retry once on failure (as per docs)
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying Gemini API call (attempt ${retryCount + 2})...`);
      return callGemini(prompt, isJsonMode, retryCount + 1);
    }

    throw new Error(`AI service error: ${error.message}`);
  }
}

/**
 * Extract structured information from user message (Prompt A)
 * Docs: "Gemini returns invalid JSON → Retry once"
 */
/**
 * Extract structured information from user message (Prompt A)
 * Docs: "Gemini returns invalid JSON → Retry once"
 *
 * @param {string} userMessage - User message to analyze
 * @param {object} canvasState - Current canvas state
 * @returns {Promise<object>} Extraction result with updates, impact, and target stage
 */
// ============================================================================
// Core AI Functions
// ============================================================================

export async function extractInformation(userMessage, canvasState) {
  // Limit canvas context: only send last 5 messages worth of context
  // and compact canvas state (not full chat history)
  const compactCanvas = limitCanvasContext(canvasState);
  const prompt = buildExtractionPrompt(userMessage, compactCanvas);

  return withFallback(
    async () => {
      const response = await callGemini(prompt, true);

      // Parse JSON response using robust extractJSON (handles trailing text, code blocks)
      const extracted = await withFallback(
        () => extractJSON(response),
        null,
        'JSON extraction failed, retrying...',
        'AI Extraction'
      );

      if (!extracted) {
        // Retry once as per docs
        const retryResponse = await callGemini(prompt, true, 1);
        return extractJSON(retryResponse);
      }

      return validateExtractionResult(extracted);
    },
    () => ({
      updates: {},
      impact: { affected_stages: [] },
      missing_stages: [],
      target_stage: 'idea',
    }),
    'Extraction failed',
    'AI Extraction'
  );
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate and normalize extraction result
 *
 * @param {object} extracted - Raw extraction result
 * @returns {object} Normalized extraction result with all required fields
 */
function validateExtractionResult(extracted) {
  if (!extracted.updates) extracted.updates = {};
  if (!extracted.impact) extracted.impact = { affected_stages: [] };
  if (!extracted.missing_stages) extracted.missing_stages = [];
  if (!extracted.target_stage) extracted.target_stage = 'idea';
  if (extracted.off_topic === undefined) extracted.off_topic = false;
  if (!extracted.redirect_message) extracted.redirect_message = '';
  return extracted;
}

// ============================================================================
// Context Management
// ============================================================================

/**
 * Limit canvas context to compact form (not full chat history)
 * Docs: "Canvas state sent as compact JSON (not full chat history)"
 *
 * @param {object} canvasState - Full canvas state
 * @returns {object} Compact canvas state for AI context
 */
function limitCanvasContext(canvasState) {
  if (!canvasState || !canvasState.stages) {
    return canvasState;
  }

  // Return compact version: only status, summary, confidence, and item count
  return {
    id: canvasState.id,
    stages: canvasState.stages.map(stage => ({
      name: stage.name,
      status: stage.status,
      summary: stage.summary,
      confidence: stage.confidence,
      item_count: stage.items ? stage.items.length : 0,
    })),
  };
}

/**
 * Generate natural conversation response (Prompt B)
 * @param {string} userMessage - Current user message
 * @param {object} canvasState - Current canvas state
 * @param {string} targetStage - Target stage for next question
 * @param {object} extractionResult - Extraction result from Prompt A
 * @param {array} recentMessages - Last 5 messages for context (docs §7.10)
 * @param {string} [composedPrompt] - Optional pre-composed prompt from promptComposer (docs/11)
 */
/**
 * Generate natural conversation response (Prompt B)
 *
 * @param {string} userMessage - Current user message
 * @param {object} canvasState - Current canvas state
 * @param {string} targetStage - Target stage for next question
 * @param {object} extractionResult - Extraction result from Prompt A
 * @param {array} recentMessages - Last 5 messages for context (docs §7.10)
 * @param {string} [composedPrompt] - Optional pre-composed prompt from promptComposer (docs/11)
 * @returns {Promise<string>} AI response text
 */
export async function generateResponse(userMessage, canvasState, targetStage, extractionResult, recentMessages = [], composedPrompt = null) {
  // Use composed prompt if provided (dynamic composition per docs/11), else fall back to static prompt
  const prompt = composedPrompt || buildConversationPrompt(userMessage, canvasState, targetStage, extractionResult, recentMessages);

  return withFallback(
    async () => {
      const response = await callGemini(prompt, false);
      return response.trim();
    },
    "I understand. Could you tell me more about that?",
    'Response generation failed',
    'AI Response'
  );
}

/**
 * Generate opening greeting for new projects
 */
export async function generateGreeting() {
  const prompt = `Generate a brief, friendly opening message for a new discovery session. 
  
Keep it under 2 sentences. Ask the user what they want to build.

Example: "Hi! I'm here to help you transform your idea into a clear project direction. What would you like to build?"

Generate now (text only):`;

  try {
    const response = await callGemini(prompt, false);
    return response.trim();
  } catch (error) {
    console.error('Greeting generation error:', error);
    return "Hi! I'm here to help you transform your idea into a clear project direction. What would you like to build?";
  }
}

/**
 * Validate extraction result structure
 */
export function validateExtraction(extraction) {
  const errors = [];

  if (!extraction || typeof extraction !== 'object') {
    errors.push('Extraction must be an object');
    return { valid: false, errors };
  }

  // Validate updates
  if (extraction.updates && typeof extraction.updates === 'object') {
    Object.entries(extraction.updates).forEach(([stage, data]) => {
      if (!data.action || !['add', 'replace', 'needs_review'].includes(data.action)) {
        errors.push(`Invalid action for stage ${stage}`);
      }
      if (!data.status || !['not_started', 'partial', 'complete', 'needs_review'].includes(data.status)) {
        errors.push(`Invalid status for stage ${stage}`);
      }
      if (data.confidence !== undefined && (data.confidence < 0 || data.confidence > 100)) {
        errors.push(`Invalid confidence for stage ${stage}`);
      }
    });
  }

  // Validate impact
  if (extraction.impact && extraction.impact.affected_stages) {
    if (!Array.isArray(extraction.impact.affected_stages)) {
      errors.push('affected_stages must be an array');
    }
  }

  // Validate missing_stages
  if (extraction.missing_stages && !Array.isArray(extraction.missing_stages)) {
    errors.push('missing_stages must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test Gemini API connection
 */
// ============================================================================
// Additional AI Operations
// ============================================================================

export async function testConnection() {
  try {
    const response = await callGemini('Respond with "OK" if you can read this.', false);
    return { success: true, message: response };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export default {
  extractInformation,
  generateResponse,
  generateGreeting,
  validateExtraction,
  testConnection,
};

// Made with Bob

/**
 * Distill canvas using AI
 * Docs §7.7: Reviews all stages, merges duplicates, identifies contradictions
 */
export async function distillCanvas(canvas) {
  const prompt = buildDistillationPrompt(canvas);

  try {
    const response = await callGemini(prompt, true);

    // Parse JSON using robust extractJSON
    const result = extractJSON(response);

    // Validate structure
    if (!result.distilled || typeof result.distilled !== 'object') {
      throw new Error('Invalid distillation result structure');
    }

    return result;
  } catch (error) {
    console.error('Distillation error:', error);
    throw new Error(`Failed to distill canvas: ${error.message}`);
  }
}

/**
 * Compile blueprint using AI
 * Docs §7.8: Compiles 11-section blueprint from distilled canvas
 */
export async function compileBlueprintWithAI(project, canvas) {
  const prompt = buildBlueprintPrompt(project, canvas);

  try {
    const response = await callGemini(prompt, true);

    // Parse JSON using robust extractJSON
    const result = extractJSON(response);

    // Validate required fields
    const requiredFields = [
      'project_name', 'problem_statement', 'primary_user',
      'workflow', 'core_pain_point', 'root_cause', 'key_evidence',
      'opportunity', 'decision', 'mvp_scope', 'next_validation'
    ];

    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return result;
  } catch (error) {
    console.error('Blueprint compilation error:', error);
    throw new Error(`Failed to compile blueprint: ${error.message}`);
  }
}

/**
 * Summarize conversation messages for context compression
 * Called every 50 messages to maintain manageable context window
 * Preserves: decisions, canvas changes, user insights, areas to explore
 * 
 * @param {array} messages - Array of message objects to summarize
 * @param {object} canvasState - Current canvas state for context
 * @returns {string} Comprehensive summary preserving all critical information
 */
export async function summarizeMessages(messages, canvasState) {
  const prompt = buildSummarizationPrompt(messages, canvasState);

  try {
    const response = await callGemini(prompt, false);
    return response.trim();
  } catch (error) {
    console.error('Summarization error:', error);
    // Return basic fallback summary
    return `SUMMARY: Conversation about project with ${messages.length} messages. Last discussed: ${messages[messages.length - 1]?.content?.substring(0, 100) || 'N/A'}`;
  }
}
