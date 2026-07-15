import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { APP_NAME } from '@/constants/app'

type NavbarProps = {
  onMenuClick: () => void
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Open navigation menu"
            leadingIcon={<MenuIcon />}
          >
            Menu
          </Button>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--app-accent-strong)]">
              StadiumPilot AI
            </p>
            <p className="text-sm text-[var(--app-muted)]">{APP_NAME} Frontend</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
