import type {
  CrowdAnalysisRequest,
  EmergencyDecisionRequest,
  IncidentReportRequest,
  StadiumAssistantRequest,
  TranslateRequest,
} from '@/services/ai/types'

export function buildFrontendPromptForAssistant(request: StadiumAssistantRequest) {
  return {
    ...request,
    question: request.question.trim(),
  }
}

export function buildFrontendPromptForCrowdAnalysis(request: CrowdAnalysisRequest) {
  return {
    ...request,
  }
}

export function buildFrontendPromptForIncidentReport(request: IncidentReportRequest) {
  return {
    ...request,
    description: request.description.trim(),
  }
}

export function buildFrontendPromptForTranslation(request: TranslateRequest) {
  return {
    ...request,
    text: request.text.trim(),
  }
}

export function buildFrontendPromptForEmergencyDecision(request: EmergencyDecisionRequest) {
  return {
    ...request,
    incident: request.incident.trim(),
  }
}
