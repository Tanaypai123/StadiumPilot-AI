import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIAbortError,
  GoogleGenerativeAIResponseError,
  GoogleGenerativeAIError,
} from '@google/generative-ai'

import { setTimeout as sleep } from 'node:timers/promises'

import { safeJsonParse } from './safeJson.js'
import { logAiEvent } from './logger.js'

const runtimeState = {
  configured: false,
  apiKey: null,
  modelName: 'gemini-2.5-flash',
  requestTimeoutMs: 12000,
  maxRetries: 2,
  genAI: null,
  model: null,
}

/**
 * Custom service error wrapping exceptions thrown by the Gemini SDK.
 * Propagates correct HTTP statuses and serializable details.
 */
export class GeminiServiceError extends Error {
  constructor(message, status = 502, details = {}) {
    super(message)
    this.name = 'GeminiServiceError'
    this.status = status
    this.details = details
  }
}

export function printFullProviderError(error) {
  console.error("=== FULL PROVIDER ERROR ===");
  if (!error) {
    console.error("Error is undefined or null");
    console.error("===========================");
    return;
  }

  console.error(`SDK Exception: ${error.name || error.constructor.name || 'Error'}: ${error.message || String(error)}`);
  
  if (error.stack) {
    console.error(`Stack Trace:\n${error.stack}`);
  } else {
    console.error("Stack Trace: N/A");
  }

  if (typeof error.status === 'number' || error.status) {
    console.error(`HTTP Status: ${error.status}`);
  } else {
    console.error("HTTP Status: N/A");
  }

  if (error.statusText) {
    console.error(`Status Text: ${error.statusText}`);
  } else {
    console.error("Status Text: N/A");
  }

  if (error.errorDetails) {
    console.error(`Response Body / Error Details: ${JSON.stringify(error.errorDetails, null, 2)}`);
  } else if (error.response) {
    console.error(`Response Body / Error Details: ${JSON.stringify(error.response, null, 2)}`);
  } else {
    console.error("Response Body / Error Details: N/A");
  }
  
  console.error("===========================");
}

/**
 * Asynchronously initializes the Gemini client and finds the best non-deprecated available model.
 * Performs progressive self-test evaluations to guarantee provider accessibility.
 * 
 * @param {object} config - Configuration mapping apiKey, requestedModelName, and request limits.
 * @returns {Promise<object>} Startup telemetry configuration log details.
 */
export async function configureGeminiClient(config) {
  if (!config.apiKey) {
    throw new Error('GEMINI_API_KEY is missing from the loaded environment')
  }

  const requestedModel = config.requestedModelName || 'gemini-2.5-flash'
  
  // Build fallback order. Never include gemini-2.5-flash-lite.
  const fallbacks = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite']
  const candidates = []
  if (requestedModel && requestedModel !== 'gemini-2.5-flash-lite') {
    candidates.push(requestedModel)
  }
  for (const m of fallbacks) {
    if (!candidates.includes(m)) {
      candidates.push(m)
    }
  }

  runtimeState.apiKey = config.apiKey
  runtimeState.requestTimeoutMs = config.requestTimeoutMs
  runtimeState.maxRetries = config.maxRetries

  let lastError = null

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    
    const startup = {
      hasApiKey: Boolean(config.apiKey),
      apiKeyPrefix: config.apiKey ? config.apiKey.slice(0, 6) : 'none',
      requestedModel: requestedModel,
      selectedModel: candidate,
      clientCreated: false,
      modelCreated: false,
    }

    try {
      runtimeState.genAI = new GoogleGenerativeAI(config.apiKey)
      startup.clientCreated = true

      runtimeState.model = runtimeState.genAI.getGenerativeModel(
        { model: candidate },
        { timeout: config.requestTimeoutMs }
      )
      startup.modelCreated = true

      // Print startup configuration before testing
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        event: 'gemini_startup_attempt',
        ...startup
      }))

      // Run internal startup self-test with retries
      let testResult = null
      const testAttempts = 3
      for (let attempt = 1; attempt <= testAttempts; attempt++) {
        try {
          testResult = await runtimeState.model.generateContent("Hello", {
            timeout: Math.max(config.requestTimeoutMs, 30000)
          })
          break
        } catch (err) {
          const isRetryable = isRetryableError(err) || (err.status && isRetryableStatus(err.status))
          if (attempt === testAttempts || !isRetryable) {
            throw err
          }
          const delay = attempt * 15000
          console.warn(`Self-test attempt ${attempt} failed with retryable error for ${candidate}. Retrying in ${delay}ms...`)
          await sleep(delay)
        }
      }

      const text = testResult.response.text().trim()
      if (!text) {
        throw new Error('Self-test returned empty response')
      }

      // Success! Update runtime state
      runtimeState.modelName = candidate
      runtimeState.configured = true

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        event: 'gemini_startup_ready',
        ...startup,
        selfTestResponse: text
      }))

      return startup
    } catch (error) {
      lastError = error
      
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        event: 'gemini_startup_attempt_failed',
        ...startup
      }))

      console.error(`Gemini model fallback: Self-test failed for model '${candidate}'`)
      printFullProviderError(error)

      runtimeState.genAI = null
      runtimeState.model = null
      runtimeState.configured = false
    }
  }

  // If all candidates failed
  console.error("Gemini client initialization failed: all candidate models failed self-test.")
  if (lastError) {
    console.error("COMPLETE EXCEPTION FOR STARTUP FAILURE:")
    console.error(lastError.stack || lastError.message || lastError)
  }
  throw lastError || new Error("Gemini model initialization failed.")
}

function getErrorMetadata(error) {
  if (error instanceof GoogleGenerativeAIFetchError) {
    return {
      kind: 'fetch',
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails,
    }
  }

  if (error instanceof GoogleGenerativeAIAbortError) {
    return {
      kind: 'timeout',
    }
  }

  if (error instanceof GoogleGenerativeAIResponseError) {
    return {
      kind: 'response',
    }
  }

  if (error instanceof GoogleGenerativeAIError) {
    return {
      kind: 'sdk',
    }
  }

  return {
    kind: 'unknown',
  }
}

function getRetryStatus(error) {
  if (error instanceof GoogleGenerativeAIFetchError) {
    return error.status
  }

  if (typeof error === 'object' && error !== null) {
    if (typeof error.status === 'number') {
      return error.status
    }

    if (typeof error.statusCode === 'number') {
      return error.statusCode
    }
  }

  return undefined
}

function isRetryableStatus(status) {
  return status === 429 || status === 503 || status === 504 || (typeof status === 'number' && status >= 500)
}

function isRetryableError(error) {
  if (error instanceof GoogleGenerativeAIAbortError) {
    return true
  }

  return isRetryableStatus(getRetryStatus(error))
}


function toPublicError(error) {
  if (error instanceof GeminiServiceError) {
    return error
  }

  const metadata = getErrorMetadata(error)
  const errorDetails = {
    sdkError: serializeSdkError(error),
  }

  if (metadata.kind === 'timeout') {
    return new GeminiServiceError('AI request timed out. Please try again.', 504, errorDetails)
  }

  if (metadata.kind === 'fetch') {
    if (metadata.status === 429) {
      return new GeminiServiceError('AI service is busy. Please try again shortly.', 429, errorDetails)
    }

    if (metadata.status === 400 || metadata.status === 401 || metadata.status === 403 || metadata.status === 404) {
      return new GeminiServiceError(`AI provider rejected the request with status ${metadata.status}.`, metadata.status, errorDetails)
    }

    if (metadata.status && metadata.status >= 500) {
      return new GeminiServiceError('AI service is temporarily unavailable. Please retry.', 503, errorDetails)
    }
  }

  if (metadata.kind === 'response') {
    return new GeminiServiceError('AI service returned an unexpected response.', 502, errorDetails)
  }

  return new GeminiServiceError('AI service is temporarily unavailable. Please retry.', 503, errorDetails)
}

function serializeSdkError(error) {
  if (!(error instanceof Error)) {
    return { value: String(error) }
  }

  const serialized = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  }

  if (typeof error.status === 'number') {
    serialized.status = error.status
  }

  if (typeof error.statusText === 'string') {
    serialized.statusText = error.statusText
  }

  if ('errorDetails' in error && Array.isArray(error.errorDetails)) {
    serialized.errorDetails = error.errorDetails
  }

  if ('response' in error && error.response !== undefined) {
    serialized.response = error.response
  }

  return serialized
}

/**
 * Checks if the Gemini client has been successfully configured.
 * @returns {boolean} True if ready.
 */
export function isConfigured() {
  return runtimeState.configured
}

/**
 * Gets the name of the currently active Gemini model candidate.
 * @returns {string|null} Active model name or null.
 */
export function getSelectedModel() {
  return runtimeState.configured ? runtimeState.modelName : null
}

/**
 * Runs a prompt query against the Gemini API.
 * Handles transient error retries (with exponential backoff) and formats standard public errors.
 * 
 * @param {string} prompt - Security XML-contained operational prompt.
 * @param {object} [context={}] - Operational tags like endpoint and requestId.
 * @returns {Promise<string>} Gemini response text.
 */
export async function runGeminiPrompt(prompt, context = {}) {
  if (!runtimeState.configured) {
    throw new GeminiServiceError('AI service is unavailable.', 503)
  }

  const maxAttempts = Math.max(1, runtimeState.maxRetries + 1)



  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const startedAt = Date.now()

    logAiEvent('info', 'ai_request_started', {
      endpoint: context.endpoint ?? 'unknown',
      requestId: context.requestId ?? 'unknown',
      model: runtimeState.modelName,
      attempt,
      maxAttempts,
    })

    try {
      const result = await runtimeState.model.generateContent(prompt, {
        timeout: runtimeState.requestTimeoutMs,
      })

      const text = result.response.text().trim()
      if (!text) {
        throw new GeminiServiceError('AI service returned an empty response.', 502)
      }

      logAiEvent('info', 'ai_request_succeeded', {
        endpoint: context.endpoint ?? 'unknown',
        requestId: context.requestId ?? 'unknown',
        model: runtimeState.modelName,
        attempt,
        durationMs: Date.now() - startedAt,
      })

      return text
    } catch (error) {
      const publicError = toPublicError(error)
      const retryable = isRetryableError(error) || isRetryableStatus(publicError.status)

      logAiEvent(retryable ? 'warn' : 'error', retryable ? 'ai_request_retry' : 'ai_request_failed', {
        endpoint: context.endpoint ?? 'unknown',
        requestId: context.requestId ?? 'unknown',
        model: runtimeState.modelName,
        attempt,
        maxAttempts,
        durationMs: Date.now() - startedAt,
        retryable,
        status: publicError.status,
        errorKind: getErrorMetadata(error).kind,
      })

      if (!retryable || attempt === maxAttempts) {
        if (publicError instanceof GeminiServiceError) {
          publicError.details = {
            ...(publicError.details || {}),
            endpoint: context.endpoint ?? 'unknown',
            requestId: context.requestId ?? 'unknown',
            model: runtimeState.modelName,
            attempt,
            maxAttempts,
            error: serializeSdkError(error),
          }
        }

        throw publicError
      }

      await sleep(1500 * attempt)
    }
  }
}

/**
 * Sanitizes and extracts a structured JSON object from the Gemini response text.
 * Throws if the response does not contain a valid JSON parse.
 * 
 * @param {string} text - Raw Gemini response output text.
 * @returns {object} Parsed JSON payload object.
 */
export function extractJson(text) {
  const parsed = safeJsonParse(text)
  if (!parsed) {
    throw new Error('Gemini did not return valid JSON')
  }

  return parsed
}
