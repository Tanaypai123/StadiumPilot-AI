export function buildStadiumAssistantPrompt({ question, context }) {
  return `
You are StadiumPilot AI, a professional stadium operations assistant.
Answer only using concise, practical guidance.
Focus on: fan questions, stadium guidance, food suggestions, parking guidance.
Do not mention hidden reasoning.
Return plain text with short bullet points when useful.
User question: ${question}
Context: ${JSON.stringify(context ?? {})}
`.trim()
}

export function buildCrowdAnalysisPrompt(crowdData) {
  return `
You are analyzing stadium crowd conditions.
Return JSON with keys: summary, risks, recommendations, confidence.
Recommendations must be actionable and concise.
Crowd data: ${JSON.stringify(crowdData)}
`.trim()
}

export function buildIncidentReportPrompt({ description, location, language }) {
  return `
You are a professional incident report writer for stadium operations.
Rewrite the volunteer description into a formal incident report.
Return JSON with keys: title, summary, severity, location, actions, language.
Original description: ${description}
Location: ${location ?? 'unspecified'}
Language: ${language ?? 'en'}
`.trim()
}

export function buildTranslationPrompt({ text, targetLanguage }) {
  return `
Translate the text into ${targetLanguage}. Preserve meaning and professional tone.
Return JSON with keys: translatedText, language.
Text: ${text}
`.trim()
}

export function buildEmergencyDecisionPrompt({ incident, context }) {
  return `
You are emergency decision support for stadium operations.
Produce cautious, practical recommendations.
Return JSON with keys: priority, immediateActions, escalation, monitoring.
Incident: ${incident}
Context: ${context ?? 'none'}
`.trim()
}
