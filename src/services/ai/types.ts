export type LanguageCode = 'en' | 'hi' | 'es' | 'fr'

export type AiRequestBase = {
  requestId?: string
}

export type StadiumAssistantRequest = AiRequestBase & {
  question: string
  context?: {
    stadiumName?: string
    area?: string
    language?: LanguageCode
  }
}

export type CrowdAnalysisRequest = AiRequestBase & {
  crowdData: {
    occupancy: number
    queueMinutes: number
    gatePressure: number
    incidentsOpen: number
  }
}

export type IncidentReportRequest = AiRequestBase & {
  description: string
  location?: string
  language?: LanguageCode
}

export type TranslateRequest = AiRequestBase & {
  text: string
  targetLanguage: LanguageCode
}

export type EmergencyDecisionRequest = AiRequestBase & {
  incident: string
  context?: string
}
