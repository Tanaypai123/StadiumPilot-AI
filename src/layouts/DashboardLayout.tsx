import { Outlet } from 'react-router-dom'

import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { useDisclosure } from '@/hooks/useDisclosure'

export function DashboardLayout() {
  const sidebarDisclosure = useDisclosure(false)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <Sidebar
        isOpen={sidebarDisclosure.isOpen}
        onClose={sidebarDisclosure.close}
        onNavigate={sidebarDisclosure.close}
      />

      <div className="flex min-h-screen flex-col">
        <Navbar onMenuClick={sidebarDisclosure.toggle} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
