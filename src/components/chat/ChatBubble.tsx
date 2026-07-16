import React from 'react'
import { cn } from '@/lib/cn'

type ChatBubbleProps = {
  role: 'assistant' | 'user'
  message: string
  timestamp?: string
}

// Custom Markdown Renderer Component
function Markdown({ text }: { text: string }) {
  // Split the text into code block portions vs normal text portions
  const parts = text.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-2 text-inherit">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Parse code block
          const lines = part.split('\n')
          const firstLine = lines[0] || '```'
          const lang = firstLine.replace('```', '').trim() || 'code'
          const code = lines.slice(1, -1).join('\n')
          return (
            <div
              key={index}
              className="my-3 overflow-hidden rounded-xl border border-[var(--app-border)] bg-zinc-900 text-zinc-100 font-mono text-xs shadow-md"
            >
              <div className="flex justify-between bg-zinc-800/80 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                <span>{lang}</span>
              </div>
              <pre className="overflow-x-auto p-4 leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          )
        } else {
          // Parse regular text line by line
          const lines = part.split('\n')
          const renderedLines: React.ReactNode[] = []

          let listItems: React.ReactNode[] = []
          let listType: 'bullet' | 'number' | null = null
          let listKey = 0

          const flushList = () => {
            if (listItems.length === 0) return
            if (listType === 'bullet') {
              renderedLines.push(
                <ul key={`list-${listKey++}`} className="list-disc pl-6 space-y-1.5 my-2.5">
                  {listItems}
                </ul>
              )
            } else if (listType === 'number') {
              renderedLines.push(
                <ol key={`list-${listKey++}`} className="list-decimal pl-6 space-y-1.5 my-2.5">
                  {listItems}
                </ol>
              )
            }
            listItems = []
            listType = null
          }

          const parseInline = (lineText: string) => {
            const boldParts = lineText.split(/(\*\*.*?\*\*)/g)
            return boldParts.map((bPart, idx) => {
              if (bPart.startsWith('**') && bPart.endsWith('**')) {
                return (
                  <strong key={idx} className="font-semibold text-inherit">
                    {bPart.slice(2, -2)}
                  </strong>
                )
              }
              return bPart;
            })
          }

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const trimmedLine = line.trim()

            // Headings
            if (trimmedLine.startsWith('#')) {
              flushList()
              const level = (trimmedLine.match(/^#+/) || ['#'])[0].length
              const headerText = trimmedLine.replace(/^#+\s*/, '')
              const parsedText = parseInline(headerText)

              if (level === 1) {
                renderedLines.push(
                  <h1 key={i} className="text-xl font-bold mt-4 mb-2 text-inherit first:mt-0">
                    {parsedText}
                  </h1>
                )
              } else if (level === 2) {
                renderedLines.push(
                  <h2 key={i} className="text-lg font-bold mt-3.5 mb-2 text-inherit first:mt-0">
                    {parsedText}
                  </h2>
                )
              } else {
                renderedLines.push(
                  <h3 key={i} className="text-base font-bold mt-3 mb-1.5 text-inherit first:mt-0">
                    {parsedText}
                  </h3>
                )
              }
            }
            // Bullet Lists
            else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
              if (listType !== 'bullet') {
                flushList()
                listType = 'bullet'
              }
              const itemText = trimmedLine.replace(/^[*-]\s+/, '')
              listItems.push(
                <li key={i} className="text-inherit leading-relaxed">
                  {parseInline(itemText)}
                </li>
              )
            }
            // Numbered Lists
            else if (/^\d+\.\s+/.test(trimmedLine)) {
              if (listType !== 'number') {
                flushList()
                listType = 'number'
              }
              const itemText = trimmedLine.replace(/^\d+\.\s+/, '')
              listItems.push(
                <li key={i} className="text-inherit leading-relaxed">
                  {parseInline(itemText)}
                </li>
              )
            }
            // Normal paragraph or empty line
            else {
              if (trimmedLine === '') {
                flushList()
                renderedLines.push(<div key={i} className="h-2.5" />)
              } else {
                flushList()
                renderedLines.push(
                  <p key={i} className="text-inherit leading-relaxed my-1 first:mt-0 last:mb-0">
                    {parseInline(line)}
                  </p>
                )
              }
            }
          }
          flushList()
          return <React.Fragment key={index}>{renderedLines}</React.Fragment>
        }
      })}
    </div>
  )
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
