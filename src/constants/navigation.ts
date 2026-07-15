import { APP_ROUTES } from '@/constants/routes'

export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    description: 'Tournament overview',
    to: APP_ROUTES.dashboard,
  },
  {
    label: 'Crowd Monitor',
    description: 'Live occupancy and flow',
    to: APP_ROUTES.crowdMonitor,
  },
  {
    label: 'Smart Navigation',
    description: 'Routes and stadium map',
    to: APP_ROUTES.smartNavigation,
  },
  {
    label: 'Incident Reporter',
    description: 'Capture and track incidents',
    to: APP_ROUTES.incidentReporter,
  },
  {
    label: 'AI Assistant',
    description: 'Chat interface only',
    to: APP_ROUTES.aiAssistant,
  },
  {
    label: 'Settings',
    description: 'Theme and accessibility',
    to: APP_ROUTES.settings,
  },
] as const
