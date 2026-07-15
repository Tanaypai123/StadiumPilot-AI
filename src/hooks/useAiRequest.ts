import { useCallback, useRef, useState } from 'react'

import { runAiRequest, type AiEndpoint, type AiResponseMap } from '@/services/ai/client'

type UseAiRequestState<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
}

export function useAiRequest<E extends AiEndpoint>(endpoint: E) {
  const [state, setState] = useState<UseAiRequestState<AiResponseMap[E]>>({
    data: null,
    error: null,
    isLoading: false,
  })
  const abortControllerRef = useRef<AbortController | null>(null)

  const run = useCallback(
    async (payload: Parameters<typeof runAiRequest<E>>[1]) => {
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
    if (!state.data) {
      return null
    }

    return state.data
  }, [state.data])

  return {
    ...state,
    run,
    retry,
    abort: () => abortControllerRef.current?.abort(),
  }
}
