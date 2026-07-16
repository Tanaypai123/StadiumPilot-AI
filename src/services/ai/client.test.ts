import { describe, expect, test, vi, beforeEach, beforeAll, afterAll } from 'vitest'

// Configure global window mockup with synchronous timeouts to bypass test delays
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    setTimeout: (fn: Function, _delay: number) => {
      fn() // Call immediately and synchronously
      return 0
    },
    clearTimeout: (_id: any) => {},
  }
}

// Mock the API client
const mockApiRequest = vi.fn()
vi.mock('@/services/api/apiClient', () => {
  return {
    apiRequest: (path: string, options: any) => mockApiRequest(path, options),
    ApiError: class ApiError extends Error {
      status: number
      constructor(message: string, status: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
      }
    },
  }
})

// Mock the environment configuration for testing
vi.mock('@/config/env', () => {
  return {
    appEnvironment: {
      appName: 'StadiumPilot AI',
      appVersion: '1.0.0',
      appMode: 'development',
      apiBaseUrl: 'http://localhost:3001/api',
      enableMocks: false,
      apiRateLimitWindowMs: 2000,
      apiRateLimitMax: 10, // Higher limit so rate limits do not interfere with other tests
    }
  }
})

import { runAiRequest } from './client'

describe('Frontend AI Client Layer', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    vi.resetAllMocks()
    vi.advanceTimersByTime(5000)
    mockApiRequest.mockImplementation(async () => {
      return { response: 'Test response' }
    })
  })

  test('runAiRequest successfully fetches and returns response payload', async () => {
    const response = await runAiRequest('stadiumAssistant', {
      question: 'Where is Gate B?',
      context: { language: 'en' }
    })
    expect(response).toEqual({ response: 'Test response' })
    expect(mockApiRequest).toHaveBeenCalledTimes(1)
  })

  test('runAiRequest stores and uses cache for matching requests', async () => {
    const payload = { question: 'Cache test query', context: { language: 'en' as const } }
    
    const res1 = await runAiRequest('stadiumAssistant', payload)
    const res2 = await runAiRequest('stadiumAssistant', payload)

    expect(res1).toEqual({ response: 'Test response' })
    expect(res2).toEqual({ response: 'Test response' })
    expect(mockApiRequest).toHaveBeenCalledTimes(1) // Network fetch triggered only once!
  })

  test('runAiRequest expires cache record when TTL limit is exceeded', async () => {
    const payload = { question: 'Cache expiration check', context: { language: 'en' as const } }
    
    // Call 1: Sets cache record (default TTL is 180000ms = 3 minutes)
    await runAiRequest('stadiumAssistant', payload)
    
    // Advance timers past 3 minutes (e.g. 200000ms)
    vi.advanceTimersByTime(200000)

    // Call 2: Should perform another network request since cache has expired
    await runAiRequest('stadiumAssistant', payload)
    expect(mockApiRequest).toHaveBeenCalledTimes(2)
  })

  test('runAiRequest deduplicates simultaneous parallel requests', async () => {
    const payload = { question: 'Deduplication test query', context: { language: 'en' as const } }
    
    // Call two identical requests in parallel
    const p1 = runAiRequest('stadiumAssistant', payload)
    const p2 = runAiRequest('stadiumAssistant', payload)
    
    const [res1, res2] = await Promise.all([p1, p2])
    expect(res1).toEqual({ response: 'Test response' })
    expect(res2).toEqual({ response: 'Test response' })
    expect(mockApiRequest).toHaveBeenCalledTimes(1) // Network request called only once!
  })

  test('runAiRequest handles AbortController options signal', async () => {
    const controller = new AbortController()
    const payload = { question: 'Abort test query' }
    
    mockApiRequest.mockImplementation(async (_path, opts) => {
      if (opts?.signal?.aborted) {
        const err = new Error('The user aborted a request.')
        err.name = 'AbortError'
        throw err
      }
      return new Promise((_resolve, reject) => {
        opts?.signal?.addEventListener('abort', () => {
          const err = new Error('The user aborted a request.')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    const requestPromise = runAiRequest('stadiumAssistant', payload, { signal: controller.signal })
    
    // Trigger abort
    controller.abort()

    await expect(requestPromise).rejects.toThrow('The user aborted a request.')
  })

  test('runAiRequest triggers client-side rate limits', async () => {
    // Making 11 distinct requests (max limit is 10)
    for (let i = 1; i <= 10; i++) {
      await runAiRequest('stadiumAssistant', { question: `Q-${i}` })
    }

    await expect(
      runAiRequest('stadiumAssistant', { question: 'Q-11' })
    ).rejects.toThrow('Too many AI requests. Please wait a moment and try again.')
  })

  test('runAiRequest retries on transient 500 error and then succeeds', async () => {
    const { ApiError } = await import('@/services/api/apiClient')
    mockApiRequest
      .mockRejectedValueOnce(new ApiError('Internal server error', 500))
      .mockResolvedValueOnce({ response: 'Recovered response' })

    const response = await runAiRequest('stadiumAssistant', { question: 'Retry test' })
    expect(response).toEqual({ response: 'Recovered response' })
    expect(mockApiRequest).toHaveBeenCalledTimes(2)
  })

  test('runAiRequest fails and stops after maximum retries are reached', async () => {
    const { ApiError } = await import('@/services/api/apiClient')
    mockApiRequest.mockRejectedValue(new ApiError('Service Unavailable', 503))

    await expect(
      runAiRequest('stadiumAssistant', { question: 'Max retry test' })
    ).rejects.toThrow('Service Unavailable')
    expect(mockApiRequest).toHaveBeenCalledTimes(2) // Max attempts: 2
  })

  test('runAiRequest throws error on empty response payload', async () => {
    mockApiRequest.mockResolvedValue({}) // Empty object

    await expect(
      runAiRequest('stadiumAssistant', { question: 'Empty response test' })
    ).rejects.toThrow('Empty AI response received')
  })
})
