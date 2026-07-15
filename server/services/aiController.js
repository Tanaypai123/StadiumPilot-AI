import {
  crowdAnalysisSchema,
  emergencyDecisionSchema,
  incidentReportSchema,
  stadiumAssistantSchema,
  translateSchema,
} from './validation.js'
import {
  buildCrowdAnalysisPrompt,
  buildEmergencyDecisionPrompt,
  buildIncidentReportPrompt,
  buildStadiumAssistantPrompt,
  buildTranslationPrompt,
} from './prompts.js'
import { extractJson, GeminiServiceError, runGeminiPrompt } from './geminiClient.js'

function getRequestId(request) {
  return typeof request.headers['x-request-id'] === 'string'
    ? request.headers['x-request-id']
    : 'unknown'
}

function respondWithValidationError(response, error) {
  return response.status(400).json({
    error: 'Invalid request',
    details: error.errors ?? error.message,
  })
}

function createJsonHandler(endpoint, schema, promptBuilder, formatter) {
  return async (request, response) => {
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return respondWithValidationError(response, parsed.error)
    }

    try {
      const prompt = promptBuilder(parsed.data)
      const rawText = await runGeminiPrompt(prompt, {
        endpoint,
        requestId: getRequestId(request),
      })
      const result = extractJson(rawText)
      return response.json(formatter ? formatter(result) : result)
    } catch (error) {
      if (error instanceof GeminiServiceError) {
        return response.status(error.status).json({
          error: error.message,
          requestId: getRequestId(request),
          endpoint,
          model: error.details?.model ?? 'unknown',
          details: error.details ?? null,
        })
      }

      return response.status(502).json({ error: 'AI service is temporarily unavailable. Please retry.' })
    }
  }
}

function createTextHandler(endpoint, schema, promptBuilder) {
  return async (request, response) => {
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      return respondWithValidationError(response, parsed.error)
    }

    try {
      const prompt = promptBuilder(parsed.data)
      const rawText = await runGeminiPrompt(prompt, {
        endpoint,
        requestId: getRequestId(request),
      })

      return response.json({
        response: rawText,
      })
    } catch (error) {
      if (error instanceof GeminiServiceError) {
        return response.status(error.status).json({
          error: error.message,
          requestId: getRequestId(request),
          endpoint,
          model: error.details?.model ?? 'unknown',
          details: error.details ?? null,
        })
      }

      return response.status(502).json({ error: 'AI service is temporarily unavailable. Please retry.' })
    }
  }
}

export function createAiController() {
  return {
    stadiumAssistant: createTextHandler('stadiumAssistant', stadiumAssistantSchema, buildStadiumAssistantPrompt),
    crowdAnalysis: createJsonHandler('crowdAnalysis', crowdAnalysisSchema, ({ crowdData }) => buildCrowdAnalysisPrompt(crowdData)),
    incidentReport: createJsonHandler('incidentReport', incidentReportSchema, buildIncidentReportPrompt),
    translate: createJsonHandler('translate', translateSchema, buildTranslationPrompt),
    emergencyDecision: createJsonHandler('emergencyDecision', emergencyDecisionSchema, buildEmergencyDecisionPrompt),
  }
}
