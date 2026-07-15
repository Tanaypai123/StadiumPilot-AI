import { appEnvironment } from '@/config/env'
import { apiRequest, ApiError } from '@/services/api/apiClient'
import { getCachedValue, setCachedValue } from '@/services/ai/cache'
import type {
  CrowdAnalysisRequest,
  EmergencyDecisionRequest,
  IncidentReportRequest,
  StadiumAssistantRequest,
  TranslateRequest,
} from '@/services/ai/types'

export type AiEndpoint =
  | 'stadiumAssistant'
  | 'crowdAnalysis'
  | 'incidentReport'
  | 'translate'
  | 'emergencyDecision'

export type AiResponseMap = {
  stadiumAssistant: { response: string }
  crowdAnalysis: { summary: string; risks: string[]; recommendations: string[]; confidence: number }
  incidentReport: { title: string; summary: string; severity: string; location: string; actions: string[]; language: string }
  translate: { translatedText: string; language: string }
  emergencyDecision: { priority: string; immediateActions: string[]; escalation: string; monitoring: string[] }
}

type EndpointRequestMap = {
  stadiumAssistant: StadiumAssistantRequest
  crowdAnalysis: CrowdAnalysisRequest
  incidentReport: IncidentReportRequest
  translate: TranslateRequest
  emergencyDecision: EmergencyDecisionRequest
}

type RequestOptions = {
  signal?: AbortSignal
}

const pendingRequests = new Map<string, Promise<unknown>>()
const requestTimestamps: number[] = []
const cacheTtlMs = 2 * 60 * 1000
const endpointPaths: Record<AiEndpoint, string> = {
  stadiumAssistant: 'stadium-assistant',
  crowdAnalysis: 'crowd-analysis',
  incidentReport: 'incident-report',
  translate: 'translate',
  emergencyDecision: 'emergency-decision',
}

function buildCacheKey(endpoint: AiEndpoint, payload: unknown) {
  return `${endpoint}:${JSON.stringify(payload)}`
}

function enforceClientRateLimit() {
  const now = Date.now()
  const cutoff = now - appEnvironment.apiRateLimitWindowMs
  while (requestTimestamps.length > 0 && requestTimestamps[0] < cutoff) {
    requestTimestamps.shift()
  }

  if (requestTimestamps.length >= appEnvironment.apiRateLimitMax) {
    throw new Error('Too many AI requests. Please wait a moment and try again.')
  }

  requestTimestamps.push(now)
}

async function requestWithRetry<T>(path: string, payload: unknown, options: RequestOptions = {}) {
  const controller = new AbortController()
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  let attempt = 0
  const maxAttempts = 2

  while (attempt < maxAttempts) {
    try {
      return await apiRequest<T>(path, {
        method: 'POST',
        body: payload,
        signal: controller.signal,
        timeoutMs: 20000,
      })
    } catch (error) {
      attempt += 1
      const apiError = error instanceof ApiError ? error : undefined
      const retryable =
        !apiError || apiError.status >= 500 || apiError.status === 429 || apiError.name === 'AbortError'

      if (!retryable || attempt >= maxAttempts) {
        throw error
      }

      await new Promise((resolve) => window.setTimeout(resolve, attempt * 750))
    }
  }

  throw new Error('Request failed unexpectedly')
}

export async function runAiRequest<E extends AiEndpoint>(
  endpoint: E,
  payload: EndpointRequestMap[E],
  options: RequestOptions = {},
) {
  const cacheKey = buildCacheKey(endpoint, payload)
  const cached = getCachedValue<AiResponseMap[E]>(cacheKey)
  if (cached) {
    return cached
  }

  const pending = pendingRequests.get(cacheKey) as Promise<AiResponseMap[E]> | undefined
  if (pending) {
    return pending
  }

  enforceClientRateLimit()

  const requestPromise = requestWithRetry<AiResponseMap[E]>(`/ai/${endpointPaths[endpoint]}`, payload, options)
    .then((response) => {
      if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
        throw new Error('Empty AI response received')
      }

      setCachedValue(cacheKey, response, cacheTtlMs)
      return response
    })
    .finally(() => {
      pendingRequests.delete(cacheKey)
    })

  pendingRequests.set(cacheKey, requestPromise)
  return requestPromise
}
