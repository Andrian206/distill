import { GoogleGenerativeAI } from '@google/generative-ai';
import SYSTEM_PROMPT from '../prompts/system.js';
import buildExtractionPrompt from '../prompts/extract.js';
import buildDistillationPrompt from '../prompts/distill.js';
import buildBlueprintPrompt from '../prompts/blueprint.js';
import buildConversationPrompt from '../prompts/converse.js';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration
const MODEL_NAME = 'gemini-3.5-flash-lite';
const GENERATION_CONFIG = {
  temperature: 0.75,
  topK: 50,
  topP: 0.95,
  maxOutputTokens: 2560,
};

/**
 * Call Gemini API with retry logic
 * Docs: "Gemini returns invalid JSON → Retry once"
 */
async function callGemini(prompt, isJsonMode = false, retryCount = 0) {
  const MAX_RETRIES = 1;
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: GENERATION_CONFIG,
  });

  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini API');
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
export async function extractInformation(userMessage, canvasState) {
  // Limit canvas context: only send last 5 messages worth of context
  // and compact canvas state (not full chat history)
  const compactCanvas = limitCanvasContext(canvasState);
  const prompt = buildExtractionPrompt(userMessage, compactCanvas);

  try {
    const response = await callGemini(prompt, true);

    // Parse JSON response with retry
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in extraction response, retrying...');
      // Retry once as per docs
      const retryResponse = await callGemini(prompt, true, 1);
      const retryJsonMatch = retryResponse.match(/\{[\s\S]*\}/);
      if (!retryJsonMatch) {
        throw new Error('No JSON found after retry');
      }
      const extracted = JSON.parse(retryJsonMatch[0]);
      return validateExtractionResult(extracted);
    }

    const extracted = JSON.parse(jsonMatch[0]);
    return validateExtractionResult(extracted);
  } catch (error) {
    console.error('Extraction error:', error);
    // Return safe default structure
    return {
      updates: {},
      impact: { affected_stages: [] },
      missing_stages: [],
      target_stage: 'idea',
    };
  }
}

/**
 * Validate and normalize extraction result
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

/**
 * Limit canvas context to compact form (not full chat history)
 * Docs: "Canvas state sent as compact JSON (not full chat history)"
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
 */
export async function generateResponse(userMessage, canvasState, targetStage, extractionResult, recentMessages = []) {
  const prompt = buildConversationPrompt(userMessage, canvasState, targetStage, extractionResult, recentMessages);

  try {
    const response = await callGemini(prompt, false);
    return response.trim();
  } catch (error) {
    console.error('Response generation error:', error);
    // Fallback response
    return "I understand. Could you tell me more about that?";
  }
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

    // Extract JSON from response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
      response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in distillation response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(jsonText);

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

    // Extract JSON from response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
      response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in blueprint response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(jsonText);

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
