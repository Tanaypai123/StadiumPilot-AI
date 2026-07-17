import { useCallback, useRef, useState } from 'react'

import { runAiRequest, type AiEndpoint, type AiResponseMap } from '@/services/ai/client'

type UseAiRequestState<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
}

/**
 * React hook that wraps the runAiRequest client function.
 * Manages loading status, error tracking, last-payload references for retries,
 * and automatic network request cancellation.
 * 
 * @param endpoint AI operational mode.
 * @returns State data, error status, loading boolean, run callback, retry callback, and abort callback.
 */
export function useAiRequest<E extends AiEndpoint>(endpoint: E) {
  const [state, setState] = useState<UseAiRequestState<AiResponseMap[E]>>({
    data: null,
    error: null,
    isLoading: false,
  })
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastPayloadRef = useRef<Parameters<typeof runAiRequest<E>>[1] | null>(null)

  const run = useCallback(
    async (payload: Parameters<typeof runAiRequest<E>>[1]) => {
      lastPayloadRef.current = payload
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()
      setState((current) => ({ ...current, isLoading: true, error: null }))

      try {
        const response = await runAiRequest(endpoint, payload, {
          signal: abortControllerRef.current.signal,
        })
        setState({ data: response, error: null, isLoading: false })
        return response
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI request failed'
        setState({ data: null, error: message, isLoading: false })
        throw error
      }
    },
    [endpoint],
  )

  const retry = useCallback(async () => {
    if (lastPayloadRef.current === null) {
      return null
    }

    return run(lastPayloadRef.current)
  }, [run])

  return {
    ...state,
    run,
    retry,
    abort: () => abortControllerRef.current?.abort(),
  }
}
