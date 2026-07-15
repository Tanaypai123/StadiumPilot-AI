import { Suspense } from 'react'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/router/AppRouter'
import { PageLoader } from '@/components/ui/LoadingState'

function App() {
  return (
    <AppProviders>
      <Suspense fallback={<PageLoader label="Loading StadiumPilot AI" />}>
        <AppRouter />
      </Suspense>
    </AppProviders>
  )
}

export default App
