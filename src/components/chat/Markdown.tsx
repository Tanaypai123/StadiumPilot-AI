import React from 'react'

/**
 * Renders inline styling (bold text via markdown) inside parsed lines.
 * @param lineText Raw line content to parse.
 * @returns React node representing styled inline elements.
 */
function parseInline(lineText: string) {
  const boldParts = lineText.split(/(\*\*.*?\*\*)/g)
  return boldParts.map((bPart, idx) => {
    if (bPart.startsWith('**') && bPart.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-inherit">
          {bPart.slice(2, -2)}
        </strong>
      )
    }
    return bPart
  })
}

/**
 * A lightweight, self-contained Markdown parser and renderer component.
 * Renders headings, bold text, bullet lists, numbered lists, and code blocks.
 */
export function Markdown({ text }: { text: string }) {
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
