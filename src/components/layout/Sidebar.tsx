import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { APP_DESCRIPTION, APP_NAME } from '@/constants/app'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { cn } from '@/lib/cn'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
  onNavigate: () => void
}

export function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const location = useLocation()

  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/50 transition-opacity duration-200 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:translate-x-0 lg:px-5',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-start justify-between gap-4 pb-6">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[var(--app-text)]">{APP_NAME}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{APP_DESCRIPTION}</p>
          </div>
          <Badge variant="outline">Foundation</Badge>
        </div>

        <nav className="flex-1 space-y-2" aria-label="Primary navigation">
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]',
                  isActive
                    ? 'border-[var(--app-border)] bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]'
                    : 'text-[var(--app-muted)] hover:border-[var(--app-border)] hover:bg-black/5 hover:text-[var(--app-text)] dark:hover:bg-white/5',
                )
              }
            >
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-current/70">{item.description}</span>
              </span>
              <span aria-hidden="true" className="text-lg leading-none text-current/40 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-accent-soft)] p-4 text-sm leading-6 text-[var(--app-text)]">
          Semantic layout, responsive navigation, theme support, and accessibility preferences are ready for feature work.
        </div>
      </aside>
    </>
  )
}
