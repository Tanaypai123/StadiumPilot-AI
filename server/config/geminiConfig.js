const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
const SUPPORTED_TEXT_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-1.5-flash',
])

function normalizeModelName(value) {
  const requestedModel = typeof value === 'string' ? value.trim() : ''

  if (requestedModel && SUPPORTED_TEXT_MODELS.has(requestedModel)) {
    return requestedModel
  }

  return DEFAULT_GEMINI_MODEL
}

export function createGeminiConfig(env = process.env) {
  const apiKey = typeof env.GEMINI_API_KEY === 'string' ? env.GEMINI_API_KEY.trim() : ''
  const requestedModelName = typeof env.GEMINI_MODEL === 'string' ? env.GEMINI_MODEL.trim() : ''
  const modelName = normalizeModelName(requestedModelName)
  const requestTimeoutMs = Number(env.AI_REQUEST_TIMEOUT_MS || 30000)
  const maxRetries = Number(env.AI_MAX_RETRIES || 2)

  return {
    apiKey: apiKey || null,
    requestedModelName: requestedModelName || DEFAULT_GEMINI_MODEL,
    modelName,
    requestTimeoutMs: Number.isFinite(requestTimeoutMs) && requestTimeoutMs > 0 ? requestTimeoutMs : 30000,
    maxRetries: Number.isFinite(maxRetries) && maxRetries >= 0 ? maxRetries : 2,
  }
}
