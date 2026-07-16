import { describe, expect, test } from 'vitest'
import {
  buildStadiumAssistantPrompt,
  buildCrowdAnalysisPrompt,
  buildIncidentReportPrompt,
  buildTranslationPrompt,
  buildEmergencyDecisionPrompt,
} from './prompts.js'

describe('Prompt Construction Templates', () => {
  test('buildStadiumAssistantPrompt includes safety guidelines and inputs', () => {
    const payload = {
      question: 'How do I reach the nearest medical tent?',
      context: { stadiumName: 'Lusail Stadium' },
    }
    const result = buildStadiumAssistantPrompt(payload)
    expect(result).toContain('<user_input>\nHow do I reach the nearest medical tent?\n</user_input>')
    expect(result).toContain('[Security Guidelines]')
    expect(result).toContain('Lusail Stadium')
  })

  test('buildStadiumAssistantPrompt handles missing context', () => {
    const result = buildStadiumAssistantPrompt({ question: 'Test' })
    expect(result).toContain('Context: {}')
  })

  test('buildCrowdAnalysisPrompt generates valid instructions', () => {
    const crowdData = { occupancy: 85, queueMinutes: 10 }
    const result = buildCrowdAnalysisPrompt(crowdData)
    expect(result).toContain('summary, risks, recommendations, confidence')
    expect(result).toContain('occupancy":85')
  })

  test('buildIncidentReportPrompt wraps volunteer text in custom tags', () => {
    const payload = {
      description: 'Fan fell down the stairs near sector 4.',
      location: 'Block 4 Concourse',
      language: 'en',
    }
    const result = buildIncidentReportPrompt(payload)
    expect(result).toContain('<volunteer_description>\nFan fell down the stairs near sector 4.\n</volunteer_description>')
    expect(result).toContain('Block 4 Concourse')
    expect(result).toContain('Language: en')
  })

  test('buildIncidentReportPrompt handles missing optional parameters', () => {
    const result = buildIncidentReportPrompt({ description: 'Fan fell' })
    expect(result).toContain('Location: unspecified')
    expect(result).toContain('Language: en')
  })

  test('buildTranslationPrompt includes translation constraints', () => {
    const payload = {
      text: 'Match starts at 8 PM',
      targetLanguage: 'es',
    }
    const result = buildTranslationPrompt(payload)
    expect(result).toContain('<translation_text>\nMatch starts at 8 PM\n</translation_text>')
    expect(result).toContain('Translate the text into es')
  })

  test('buildEmergencyDecisionPrompt has custom containment tags', () => {
    const payload = {
      incident: 'Power failure near main scoreboard',
      context: 'Backup generator active but at 50%',
    }
    const result = buildEmergencyDecisionPrompt(payload)
    expect(result).toContain('<emergency_incident>\nPower failure near main scoreboard\n</emergency_incident>')
    expect(result).toContain('Backup generator active but at 50%')
  })

  test('buildEmergencyDecisionPrompt handles missing context', () => {
    const result = buildEmergencyDecisionPrompt({ incident: 'Fire' })
    expect(result).toContain('Context: none')
  })
})
