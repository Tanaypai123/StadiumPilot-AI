import { createAiController } from '../services/aiController.js'

export function registerAiRoutes(app) {
  const controller = createAiController()

  app.post('/api/ai/stadium-assistant', controller.stadiumAssistant)
  app.post('/api/ai/crowd-analysis', controller.crowdAnalysis)
  app.post('/api/ai/incident-report', controller.incidentReport)
  app.post('/api/ai/translate', controller.translate)
  app.post('/api/ai/emergency-decision', controller.emergencyDecision)
}
