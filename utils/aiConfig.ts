/**
 * AI Configuration
 * Scope 12.1: Configuración de OpenAI API para generación de contenido
 * 
 * Configuración y validación de API key de OpenAI
 */

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o'; // Usar gpt-4o si está disponible, sino gpt-4-turbo-preview

export interface AIConfig {
  apiKey: string | undefined;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export const aiConfig: AIConfig = {
  apiKey: OPENAI_API_KEY,
  model: OPENAI_MODEL,
  maxTokens: 1000,
  temperature: 0.7, // Balance entre creatividad y precisión
  timeout: 30000, // 30 segundos
};

/**
 * Validar que la API key esté configurada
 */
export function isAIConfigured(): boolean {
  return !!aiConfig.apiKey && aiConfig.apiKey.trim().length > 0;
}

/**
 * Obtener mensaje de error si la API key no está configurada
 */
export function getAIConfigError(): string | null {
  if (!isAIConfigured()) {
    return 'OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env';
  }
  return null;
}

/**
 * Rate limiting básico
 * Nota: En producción, esto debería manejarse en el backend
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre requests

export function canMakeRequest(): boolean {
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    return false;
  }
  lastRequestTime = now;
  return true;
}

