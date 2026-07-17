import { cn } from '@/lib/cn'
import { Markdown } from './Markdown'

type ChatBubbleProps = {
  role: 'assistant' | 'user'
  message: string
  timestamp?: string
}


const UserAvatar = () => (
  <div
    className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0 select-none"
    aria-hidden="true"
  >
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
)

const AIAvatar = () => (
  <div
    className="h-9 w-9 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-sm flex-shrink-0 select-none"
    aria-hidden="true"
  >
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM19.071 4.929l-.707 3.536L14.828 9l3.536.707.707 3.536 3.536-.707-3.536-.707-.707-3.536z"
      />
    </svg>
  </div>
)

export function ChatBubble({ role, message, timestamp }: ChatBubbleProps) {
  const isAssistant = role === 'assistant'

  return (
    <div
      className={cn(
        'flex w-full gap-3 mb-5 animate-message items-start',
        isAssistant ? 'flex-row justify-start' : 'flex-row-reverse justify-start'
      )}
    >
      {/* Avatar */}
      {isAssistant ? <AIAvatar /> : <UserAvatar />}

      {/* Bubble + Timestamp */}
      <div className={cn('flex flex-col max-w-[70%]', isAssistant ? 'items-start' : 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            isAssistant
              ? 'rounded-tl-none border border-[var(--app-border)] bg-[var(--app-surface-solid)] text-[var(--app-text)] focus-visible:ring-[var(--app-border)]'
              : 'rounded-tr-none bg-[var(--app-accent)] text-white focus-visible:ring-[var(--app-accent)]'
          )}
          tabIndex={0}
          aria-label={`${isAssistant ? 'AI Assistant' : 'You'} said: ${message}`}
        >
          {isAssistant ? <Markdown text={message} /> : <p className="whitespace-pre-wrap">{message}</p>}
        </div>

        {/* Timestamp */}
        {timestamp ? (
          <span
            className={cn(
              'mt-1.5 text-[10px] font-medium tracking-wide uppercase',
              isAssistant ? 'text-[var(--app-muted)]' : 'text-[var(--app-muted)]/80'
            )}
          >
            {timestamp}
          </span>
        ) : null}
      </div>
    </div>
  )
}
