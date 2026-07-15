import { useEffect } from 'react'

export function useGlobalErrorHandlers() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled application error:', event.error ?? event.message)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
}
