import { z } from 'zod'

const safeText = z
  .string()
  .trim()
  .min(1)
  .max(4000)
  .refine((value) => !/[<>]/.test(value), 'Unsafe characters detected')

export const stadiumAssistantSchema = z.object({
  question: safeText,
  context: z
    .object({
      stadiumName: z.string().trim().min(1).max(120).optional(),
      area: z.string().trim().min(1).max(120).optional(),
      language: z.enum(['en', 'hi', 'es', 'fr']).optional(),
    })
    .optional(),
})

export const crowdAnalysisSchema = z.object({
  crowdData: z
    .object({
      occupancy: z.number().min(0).max(100),
      queueMinutes: z.number().min(0).max(180),
      gatePressure: z.number().min(0).max(100),
      incidentsOpen: z.number().min(0).max(100),
    })
    .passthrough(),
})

export const incidentReportSchema = z.object({
  description: safeText,
  location: z.string().trim().min(1).max(200).optional(),
  language: z.enum(['en', 'hi', 'es', 'fr']).optional(),
})

export const translateSchema = z.object({
  text: safeText,
  targetLanguage: z.enum(['en', 'hi', 'es', 'fr']),
})

export const emergencyDecisionSchema = z.object({
  incident: safeText,
  context: z.string().trim().max(2000).optional(),
})
