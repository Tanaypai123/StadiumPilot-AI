import { describe, expect, test, vi, beforeEach } from 'vitest'

// Mock sleep/timeout delays to resolve immediately
vi.mock('node:timers/promises', () => {
  return {
    setTimeout: async () => {}
  }
})

// Dynamic mock state for LLM simulation
const mockState = {
  shouldFail: false,
  failCount: 0,
  currentCount: 0,
  errorToThrow: null,
  textResponse: 'Hello mock response',
}

// Mock the generative AI package using class syntax for constructor support
vi.mock('@google/generative-ai', () => {
  class MockGoogleGenerativeAI {
    constructor(apiKey) {
      this.apiKey = apiKey
    }
    getGenerativeModel({ model }) {
      return {
        generateContent: async (_prompt, _options) => {
          if (model === 'gemini-fail' || mockState.errorToThrow?.message === 'Global fail') {
            throw new Error('Self-test failed')
          }
          
          if (mockState.shouldFail) {
            if (mockState.currentCount < mockState.failCount) {
              mockState.currentCount++
              throw mockState.errorToThrow || new Error('Quota exceeded')
            }
          }
          
          return {
            response: {
              text: () => mockState.textResponse
            }
          }
        }
      }
    }
  }

  // Define Mock base classes with custom Symbol.hasInstance overrides for robust test matching
  class GoogleGenerativeAIError extends Error {
    constructor(message) {
      super(message)
      this.name = 'GoogleGenerativeAIError'
    }
    static [Symbol.hasInstance](instance) {
      return instance && (
        instance.name === 'GoogleGenerativeAIError' ||
        instance.constructor.name === 'GoogleGenerativeAIError'
      )
    }
  }
  
  class GoogleGenerativeAIFetchError extends GoogleGenerativeAIError {
    constructor(message, status) {
      super(message)
      this.name = 'GoogleGenerativeAIFetchError'
      this.status = status
    }
    static [Symbol.hasInstance](instance) {
      return instance && (
        instance.name === 'GoogleGenerativeAIFetchError' ||
        instance.constructor.name === 'GoogleGenerativeAIFetchError'
      )
    }
  }

  class GoogleGenerativeAIAbortError extends GoogleGenerativeAIError {
    constructor(message) {
      super(message)
      this.name = 'GoogleGenerativeAIAbortError'
    }
    static [Symbol.hasInstance](instance) {
      return instance && (
        instance.name === 'GoogleGenerativeAIAbortError' ||
        instance.constructor.name === 'GoogleGenerativeAIAbortError'
      )
    }
  }

  class GoogleGenerativeAIResponseError extends GoogleGenerativeAIError {
    constructor(message) {
      super(message)
      this.name = 'GoogleGenerativeAIResponseError'
    }
    static [Symbol.hasInstance](instance) {
      return instance && (
        instance.name === 'GoogleGenerativeAIResponseError' ||
        instance.constructor.name === 'GoogleGenerativeAIResponseError'
      )
    }
  }

  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI,
    GoogleGenerativeAIError,
    GoogleGenerativeAIFetchError,
    GoogleGenerativeAIAbortError,
    GoogleGenerativeAIResponseError,
  }
})

// Now import the client and helper classes
import { configureGeminiClient, extractJson, runGeminiPrompt, isConfigured, getSelectedModel } from './geminiClient.js'
import { GoogleGenerativeAIFetchError, GoogleGenerativeAIResponseError, GoogleGenerativeAIAbortError, GoogleGenerativeAIError } from '@google/generative-ai'

describe('Gemini Client Service Layer', () => {
  beforeEach(() => {
    mockState.shouldFail = false
    mockState.failCount = 0
    mockState.currentCount = 0
    mockState.errorToThrow = null
    mockState.textResponse = 'Hello mock response'
  })

  // CRITICAL: This test must run first before configureGeminiClient sets the global state
  test('runGeminiPrompt throws if called before client configuration', async () => {
    expect(isConfigured()).toBe(false)
    expect(getSelectedModel()).toBeNull()
    await expect(
      runGeminiPrompt('Test prompt', {})
    ).rejects.toThrow('AI service is unavailable.')
  })

  test('extractJson parses correct JSON', () => {
    const text = 'Some leading text {"value": 123} trailing text'
    const parsed = extractJson(text)
    expect(parsed).toEqual({ value: 123 })
  })

  test('extractJson throws error on invalid JSON', () => {
    const text = 'no JSON here'
    expect(() => extractJson(text)).toThrow()
  })

  test('configureGeminiClient succeeds on valid model config', async () => {
    const config = {
      apiKey: 'AIzaSyMockKey',
      requestedModelName: 'gemini-3.1-flash-lite',
      requestTimeoutMs: 1000,
      maxRetries: 1,
    }
    const result = await configureGeminiClient(config)
    expect(result.hasApiKey).toBe(true)
    expect(result.selectedModel).toBe('gemini-3.1-flash-lite')
    expect(isConfigured()).toBe(true)
    expect(getSelectedModel()).toBe('gemini-3.1-flash-lite')
  })

  test('configureGeminiClient falls back to alternative candidates if requested fails', async () => {
    const config = {
      apiKey: 'AIzaSyMockKey',
      requestedModelName: 'gemini-fail', // Will fail mock self-test
      requestTimeoutMs: 1000,
      maxRetries: 0,
    }
    const result = await configureGeminiClient(config)
    expect(result.selectedModel).toBe('gemini-2.5-flash')
  })

  test('configureGeminiClient throws error if all candidate models fail self-tests', async () => {
    mockState.errorToThrow = new Error('Global fail')
    const config = {
      apiKey: 'AIzaSyMockKey',
      requestedModelName: 'gemini-fail',
      requestTimeoutMs: 1000,
      maxRetries: 0,
    }
    await expect(configureGeminiClient(config)).rejects.toThrow('Self-test failed')
  })

  test('runGeminiPrompt successfully generates text content', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 2 })
    const response = await runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    expect(response).toBe('Hello mock response')
  })

  test('runGeminiPrompt successfully generates text content with empty context', async () => {
    // Tests the fallback logic for context properties in logger events
    const response = await runGeminiPrompt('Test prompt', {})
    expect(response).toBe('Hello mock response')
  })

  test('runGeminiPrompt throws 502 if model returns empty response text', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 0 })
    mockState.textResponse = '' // Empty response

    await expect(
      runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    ).rejects.toThrow('AI service returned an empty response.')
  })

  test('runGeminiPrompt retries on transient rate limits and then succeeds', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 2 })
    
    // Fail once with a mock 429 rate limit error containing response details to cover error serialization paths
    mockState.shouldFail = true
    mockState.failCount = 1
    const fetchErr = new GoogleGenerativeAIFetchError('Quota exceeded', 429)
    fetchErr.statusText = 'Too Many Requests'
    fetchErr.response = { statusText: 'Too Many Requests', headers: {} }
    fetchErr.errorDetails = [{ message: 'Detail check' }]
    mockState.errorToThrow = fetchErr
    mockState.textResponse = 'Succeeded after retry'

    const response = await runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    expect(response).toBe('Succeeded after retry')
    expect(mockState.currentCount).toBe(1)
  })

  test('runGeminiPrompt retries on 503 fetch error and then succeeds', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 2 })
    
    mockState.shouldFail = true
    mockState.failCount = 1
    const fetchErr = new GoogleGenerativeAIFetchError('Service unavailable', 503)
    mockState.errorToThrow = fetchErr
    mockState.textResponse = 'Succeeded after 503 retry'

    const response = await runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    expect(response).toBe('Succeeded after 503 retry')
  })

  test('runGeminiPrompt retries on transient statusCode custom objects and then succeeds', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 2 })
    
    mockState.shouldFail = true
    mockState.failCount = 1
    // Throw an object with custom statusCode instead of status
    mockState.errorToThrow = { statusCode: 503, message: 'Custom object statusCode' }
    mockState.textResponse = 'Succeeded after custom retry'

    const response = await runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    expect(response).toBe('Succeeded after custom retry')
  })

  test('runGeminiPrompt retries on raw string exceptions and then succeeds', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 2 })
    
    mockState.shouldFail = true
    mockState.failCount = 1
    // Throw a raw string instead of an Error object
    mockState.errorToThrow = 'Raw string error exception'
    mockState.textResponse = 'Succeeded after raw retry'

    const response = await runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    expect(response).toBe('Succeeded after raw retry')
    expect(mockState.currentCount).toBe(1)
  })

  test('runGeminiPrompt fails immediately on non-retryable 403 Forbidden error', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 2 })
    
    mockState.shouldFail = true
    mockState.failCount = 1
    mockState.errorToThrow = new GoogleGenerativeAIFetchError('Invalid API Key', 403)

    await expect(
      runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    ).rejects.toThrow('rejected the request with status 403')
  })

  test('runGeminiPrompt fails immediately on GoogleGenerativeAIResponseError', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 0 })
    
    mockState.shouldFail = true
    mockState.failCount = 1
    mockState.errorToThrow = new GoogleGenerativeAIResponseError('Mock response error')

    await expect(
      runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    ).rejects.toThrow('AI service returned an unexpected response.')
  })

  test('runGeminiPrompt fails immediately on generic GoogleGenerativeAIError', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 0 })
    
    mockState.shouldFail = true
    mockState.failCount = 1
    mockState.errorToThrow = new GoogleGenerativeAIError('Mock generic SDK error')

    await expect(
      runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    ).rejects.toThrow('AI service is temporarily unavailable')
  })

  test('runGeminiPrompt retries on GoogleGenerativeAIAbortError and throws 504 on exhaustion', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 1 })
    
    mockState.shouldFail = true
    mockState.failCount = 2 // Will exhaust all 2 attempts
    mockState.errorToThrow = new GoogleGenerativeAIAbortError('Mock abort timeout')

    await expect(
      runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    ).rejects.toThrow('AI request timed out. Please try again.')
  })

  test('runGeminiPrompt fails after maximum retries are reached', async () => {
    await configureGeminiClient({ apiKey: 'AIzaSyKey', requestedModelName: 'gemini-2.5-flash', maxRetries: 1 })
    
    mockState.shouldFail = true
    mockState.failCount = 3 // Max attempts is 2 (maxRetries + 1), so it will exhaust retries
    mockState.errorToThrow = new GoogleGenerativeAIFetchError('Service Busy', 429)

    await expect(
      runGeminiPrompt('Test prompt', { endpoint: 'stadiumAssistant' })
    ).rejects.toThrow('AI service is busy')
  })
})
