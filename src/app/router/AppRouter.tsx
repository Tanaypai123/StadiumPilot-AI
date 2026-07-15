import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { DashboardLayout } from '@/layouts/DashboardLayout'

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const CrowdMonitorPage = lazy(() => import('@/pages/crowd-monitor/CrowdMonitorPage'))
const SmartNavigationPage = lazy(() => import('@/pages/smart-navigation/SmartNavigationPage'))
const IncidentReporterPage = lazy(() => import('@/pages/incident-reporter/IncidentReporterPage'))
const AIAssistantPage = lazy(() => import('@/pages/ai-assistant/AIAssistantPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage'))

export function AppRouter() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="crowd-monitor" element={<CrowdMonitorPage />} />
        <Route path="smart-navigation" element={<SmartNavigationPage />} />
        <Route path="incident-reporter" element={<IncidentReporterPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/operations" element={<Navigate to="/crowd-monitor" replace />} />
      <Route path="/experience" element={<Navigate to="/smart-navigation" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
