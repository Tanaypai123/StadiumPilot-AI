import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { APP_ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-xl space-y-5 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--app-muted)]">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--app-text)]">Page not found</h1>
        <p className="text-sm leading-6 text-[var(--app-muted)]">
          The requested route does not exist yet. Return to the dashboard shell to continue.
        </p>
        <div className="flex justify-center">
          <Link
            to={APP_ROUTES.dashboard}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--app-accent)] px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[var(--app-accent-strong)]"
          >
            Back to dashboard
          </Link>
        </div>
      </Card>
    </div>
  )
}
