import { describe, expect, test } from 'vitest'
import {
  stadiumAssistantSchema,
  crowdAnalysisSchema,
  incidentReportSchema,
  translateSchema,
  emergencyDecisionSchema,
} from './validation.js'

describe('Zod Input Validation Schemas', () => {
  describe('stadiumAssistantSchema', () => {
    test('passes on valid request input', () => {
      const payload = {
        question: 'Where is exit Gate A?',
        context: {
          stadiumName: 'StadiumPilot Arena',
          area: 'Block 112',
          language: 'en',
        },
      }
      const result = stadiumAssistantSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    test('rejects injection or invalid characters', () => {
      const payload = {
        question: '<script>alert("hack")</script>',
      }
      const result = stadiumAssistantSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })

    test('rejects empty inputs', () => {
      const payload = { question: '' }
      const result = stadiumAssistantSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('crowdAnalysisSchema', () => {
    test('passes on valid crowd levels', () => {
      const payload = {
        crowdData: {
          occupancy: 80,
          queueMinutes: 15,
          gatePressure: 45,
          incidentsOpen: 1,
        },
      }
      const result = crowdAnalysisSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    test('rejects invalid or out of bounds numbers', () => {
      const payload = {
        crowdData: {
          occupancy: 120, // max 100
          queueMinutes: -5,
          gatePressure: 50,
          incidentsOpen: 0,
        },
      }
      const result = crowdAnalysisSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('incidentReportSchema', () => {
    test('passes on valid incident descriptions', () => {
      const payload = {
        description: 'Minor fire reported near Block A.',
        location: 'Concourse A',
        language: 'en',
      }
      const result = incidentReportSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    test('rejects unsafe text description', () => {
      const payload = {
        description: 'An incident description with > character.',
      }
      const result = incidentReportSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('translateSchema', () => {
    test('passes on valid translation parameters', () => {
      const payload = {
        text: 'Hello, welcome to the match!',
        targetLanguage: 'es',
      }
      const result = translateSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    test('rejects invalid target languages', () => {
      const payload = {
        text: 'Translate me',
        targetLanguage: 'de', // Unsupported language
      }
      const result = translateSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('emergencyDecisionSchema', () => {
    test('passes on valid emergency payload', () => {
      const payload = {
        incident: 'Medical emergency near Gate 3',
        context: 'St John ambulance team dispatched',
      }
      const result = emergencyDecisionSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    test('rejects context exceeding max limit', () => {
      const payload = {
        incident: 'Fire alarm block B',
        context: 'A'.repeat(2500),
      }
      const result = emergencyDecisionSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })
})
