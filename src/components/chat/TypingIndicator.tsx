
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

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 mb-5 items-start justify-start animate-message">
      <AIAvatar />
      <div className="flex flex-col items-start max-w-[70%]">
        <div
          className="rounded-2xl rounded-tl-none border border-[var(--app-border)] bg-[var(--app-surface-solid)] text-[var(--app-text)] px-5 py-4 shadow-sm"
          role="status"
          aria-label="Gemini is typing"
        >
          <div className="flex items-center gap-1.5 h-5">
            <span className="h-2 w-2 rounded-full bg-[var(--app-muted)] animate-bounce-dot" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-[var(--app-muted)] animate-bounce-dot" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-[var(--app-muted)] animate-bounce-dot" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
