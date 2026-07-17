import { vi, describe, test, expect, beforeEach } from 'vitest'
import { useAiRequest } from './useAiRequest'
import { runAiRequest } from '@/services/ai/client'

// Mock react hooks
let mockState: any = null
const mockSetState = vi.fn((updater) => {
  if (typeof updater === 'function') {
    mockState = updater(mockState)
  } else {
    mockState = updater
  }
})

vi.mock('react', () => {
  return {
    useState: (initial: any) => {
      mockState = initial
      return [mockState, mockSetState]
    },
    useCallback: (fn: any) => fn,
    useRef: (initial: any) => ({ current: initial }),
  }
})

vi.mock('@/services/ai/client', () => {
  return {
    runAiRequest: vi.fn(),
  }
})

describe('useAiRequest hook', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockState = null
  })

  test('should initialize with correct default state', () => {
    const hook = useAiRequest('stadiumAssistant')
    expect(hook.data).toBeNull()
    expect(hook.error).toBeNull()
    expect(hook.isLoading).toBe(false)
  })

  test('should execute run and set loading then success state', async () => {
    const mockResponse = { response: 'Hello!' }
    vi.mocked(runAiRequest).mockResolvedValueOnce(mockResponse as any)

    const hook = useAiRequest('stadiumAssistant')
    
    // Simulate run
    const runPromise = hook.run({ question: 'Hi' })
    
    // Assert runAiRequest was called
    expect(runAiRequest).toHaveBeenCalledWith(
      'stadiumAssistant',
      { question: 'Hi' },
      expect.any(Object)
    )

    const res = await runPromise
    expect(res).toEqual(mockResponse)
  })

  test('should handle run errors', async () => {
    vi.mocked(runAiRequest).mockRejectedValueOnce(new Error('Network error'))

    const hook = useAiRequest('stadiumAssistant')
    
    await expect(hook.run({ question: 'Hi' })).rejects.toThrow('Network error')
  })

  test('should handle retry when no last payload is present', async () => {
    const hook = useAiRequest('stadiumAssistant')
    const res = await hook.retry()
    expect(res).toBeNull()
  })

  test('should retry using the same payload', async () => {
    const mockResponse = { response: 'Retry success' }
    vi.mocked(runAiRequest)
      .mockResolvedValueOnce({ response: 'First call' } as any)
      .mockResolvedValueOnce(mockResponse as any)

    const hook = useAiRequest('stadiumAssistant')
    
    await hook.run({ question: 'Initial' })
    const retryPromise = hook.retry()
    
    const res = await retryPromise
    expect(res).toEqual(mockResponse)
    expect(runAiRequest).toHaveBeenCalledTimes(2)
  })

  test('should call abort on current controller', () => {
    const abortSpy = vi.fn()
    const originalAbortController = globalThis.AbortController
    globalThis.AbortController = class {
      signal = {} as any
      abort = abortSpy
    } as any

    const hook = useAiRequest('stadiumAssistant')
    hook.run({ question: 'Hi' })
    hook.abort()

    expect(abortSpy).toHaveBeenCalled()

    globalThis.AbortController = originalAbortController
  })

  test('should handle raw string exceptions', async () => {
    vi.mocked(runAiRequest).mockRejectedValueOnce('Raw string error' as any)

    const hook = useAiRequest('stadiumAssistant')
    
    await expect(hook.run({ question: 'Hi' })).rejects.toBe('Raw string error')
    expect(mockState.error).toBe('AI request failed')
  })

  test('should handle abort when abortController is null', () => {
    const hook = useAiRequest('stadiumAssistant')
    // No run called, so abortController is null
    expect(() => hook.abort()).not.toThrow()
  })
})
