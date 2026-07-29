import { GoogleGenerativeAI } from '@google/generative-ai';
import SYSTEM_PROMPT from '../prompts/system.js';
import buildExtractionPrompt from '../prompts/extract.js';
import buildConversationPrompt from '../prompts/converse.js';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration
const MODEL_NAME = 'gemini-1.5-flash';
const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

/**
 * Call Gemini API with retry logic
 */
async function callGemini(prompt, isJsonMode = false) {
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
    throw new Error(`AI service error: ${error.message}`);
  }
}

/**
 * Extract structured information from user message (Prompt A)
 */
export async function extractInformation(userMessage, canvasState) {
  const prompt = buildExtractionPrompt(userMessage, canvasState);
  
  try {
    const response = await callGemini(prompt, true);
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in extraction response, returning empty structure');
      return {
        updates: {},
        impact: { affected_stages: [] },
        missing_stages: [],
        target_stage: 'idea',
      };
    }

    const extracted = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!extracted.updates) extracted.updates = {};
    if (!extracted.impact) extracted.impact = { affected_stages: [] };
    if (!extracted.missing_stages) extracted.missing_stages = [];
    if (!extracted.target_stage) extracted.target_stage = 'idea';

    return extracted;
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
 * Generate natural conversation response (Prompt B)
 */
export async function generateResponse(userMessage, canvasState, targetStage, extractionResult) {
  const prompt = buildConversationPrompt(userMessage, canvasState, targetStage, extractionResult);
  
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
