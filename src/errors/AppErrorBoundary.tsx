import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

import { APP_NAME } from '@/constants/app'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application render error:', error, errorInfo)
  }

  handleRetry = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center px-4 py-10">
          <Card className="w-full max-w-xl space-y-5 p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--app-muted)]">
              {APP_NAME}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--app-text)]">
              Something went wrong
            </h1>
            <p className="text-sm leading-6 text-[var(--app-muted)]">
              The interface hit an unexpected error. Reload the app to try again.
            </p>
            {this.state.error ? (
              <p className="rounded-2xl bg-black/5 p-4 text-left text-xs leading-5 text-[var(--app-muted)] dark:bg-white/5">
                {this.state.error.message}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={this.handleRetry}>Reload application</Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
