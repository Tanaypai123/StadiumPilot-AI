import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { InlineLoader } from '@/components/ui/LoadingState'
import { useAiRequest } from '@/hooks/useAiRequest'
import { buildFrontendPromptForAssistant } from '@/services/ai/prompts'
import type { LanguageCode } from '@/services/ai/types'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  text: string
  timestamp: string
}

type AssistantMode = 'assistant' | 'crowd-analysis' | 'incident-generator' | 'translate' | 'emergency'

const promptSuggestions = [
  'Show me a crowd summary',
  'What routes are least busy?',
  'Help me report an incident',
  'List accessibility options',
]

const languageOptions: Array<{ label: string; value: LanguageCode }> = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
]

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function pickLocalReply(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('crowd')) return 'Crowd conditions look moderate. Keep entrances open and direct fans to less busy gates.'
  if (normalized.includes('route') || normalized.includes('parking')) return 'Use the main concourse route for balanced flow and accessible parking guidance.'
  if (normalized.includes('food')) return 'Recommend food stalls closest to the lower bowl to reduce travel time for fans.'
  if (normalized.includes('incident')) return 'Capture the issue details and submit it for formal incident reporting.'
  return 'I can help with stadium guidance, food suggestions, parking guidance, crowd analysis, incidents, and translations.'
}

export default function AIAssistantPage() {
  const [mode, setMode] = useState<AssistantMode>('assistant')
  const [language, setLanguage] = useState<LanguageCode>('en')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      text: 'Welcome to StadiumPilot AI. I am your co-pilot for stadium guidance, crowd flow monitoring, incident reporting, multilingual translation, and emergency response.',
      timestamp: nowLabel(),
    },
  ])
  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const assistantRequest = useAiRequest('stadiumAssistant')
  const crowdRequest = useAiRequest('crowdAnalysis')
  const incidentRequest = useAiRequest('incidentReport')
  const translateRequest = useAiRequest('translate')
  const emergencyRequest = useAiRequest('emergencyDecision')

  const currentLoading =
    assistantRequest.isLoading ||
    crowdRequest.isLoading ||
    incidentRequest.isLoading ||
    translateRequest.isLoading ||
    emergencyRequest.isLoading

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isTyping, currentLoading])

  const canSend = draft.trim().length > 0 && !currentLoading && !isTyping

  const appendAssistantMessage = (text: string) => {
    setMessages((current) => [
      ...current,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text,
        timestamp: nowLabel(),
      },
    ])
  }

  const appendUserMessage = (text: string) => {
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', text, timestamp: nowLabel() },
    ])
  }

  const sendMessage = async (text: string) => {
    const message = text.trim()
    if (!message) {
      return
    }

    setErrorMessage(null)
    appendUserMessage(message)
    setDraft('')
    setIsTyping(true)

    try {
      if (mode === 'crowd-analysis') {
        const response = await crowdRequest.run({
          crowdData: { occupancy: 72, queueMinutes: 9, gatePressure: 61, incidentsOpen: 2 },
        })
        appendAssistantMessage(`### Crowd Analysis Summary\n${response.summary}\n\n**Recommendations:**\n* ${response.recommendations.join('\n* ')}\n\n**Confidence Level:** ${response.confidence || '0.9'}`)
      } else if (mode === 'incident-generator') {
        const response = await incidentRequest.run({
          description: message,
          location: 'Main stadium concourse',
          language,
        })
        appendAssistantMessage(`### Incident Report: ${response.title}\n\n**Summary:**\n${response.summary}\n\n**Actions Required:**\n* ${response.actions.join('\n* ')}\n\n**Severity Level:** **${response.severity || 'Medium'}**`)
      } else if (mode === 'translate') {
        const response = await translateRequest.run({
          text: message,
          targetLanguage: language,
        })
        appendAssistantMessage(`**Translated Text (${language.toUpperCase()}):**\n\n${response.translatedText}`)
      } else if (mode === 'emergency') {
        const response = await emergencyRequest.run({
          incident: message,
          context: 'Stadium operations and public safety guidance required.',
        })
        const actionsMarkdown = Array.isArray(response.immediateActions)
          ? `* ${response.immediateActions.join('\n* ')}`
          : `* ${response.immediateActions}`
        appendAssistantMessage(`### Emergency Directive\n\n**Priority level:** **${response.priority}**\n\n**Immediate Actions:**\n${actionsMarkdown}\n\n**Escalation Directives:**\n${response.escalation}`)
      } else {
        const response = await assistantRequest.run(
          buildFrontendPromptForAssistant({
            question: message,
            context: { stadiumName: 'StadiumPilot Arena', language },
          }),
        )
        appendAssistantMessage(response.response || pickLocalReply(message))
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'AI request failed'
      setErrorMessage(messageText)
      appendAssistantMessage('Unable to process the request right now. Please retry in a moment.')
    } finally {
      setIsTyping(false)
    }
  }

  const suggestionButtons = promptSuggestions.map((suggestion) => ({
    label: suggestion,
    action: () => sendMessage(suggestion),
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Badge>Gemini enabled</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--app-text)]">AI Assistant</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
          Real-time stadium assistant powered by Gemini. Supports crowd flows, incident reporting, translation, and safety escalation rules.
        </p>
      </div>

      {/* Main Grid: Left Panel (Settings) and Right Panel (Chat) */}
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr] items-start">
        {/* Left Settings Sidebar */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Assistant Mode</CardTitle>
              <CardDescription className="text-xs">Choose specific operational expertise.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {[
                ['assistant', 'AI Stadium Assistant'],
                ['crowd-analysis', 'Crowd Analysis'],
                ['incident-generator', 'Incident Generator'],
                ['translate', 'Multilingual Translation'],
                ['emergency', 'Emergency Escalation'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value as AssistantMode)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] ${
                    mode === value
                      ? 'bg-[var(--app-accent)] text-white shadow-sm border border-transparent'
                      : 'bg-[var(--app-surface-solid)] border border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-bg)]'
                  }`}
                  aria-pressed={mode === value}
                >
                  {label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Context Options */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--app-text)]" htmlFor="assistant-language">
                  Target Language
                </label>
                <select
                  id="assistant-language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] px-3.5 py-2.5 text-sm text-[var(--app-text)] outline-none transition-colors focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)] focus:outline-none"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Trigger */}
              <button
                type="button"
                onClick={() => setDraft('Security Alert: Minor congestion reported near block 112.')}
                className="w-full py-2.5 px-4 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-bg)] text-xs font-semibold text-[var(--app-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
              >
                Use sample prompt
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right Chat Container */}
        <Card className="flex flex-col min-h-[620px] lg:h-[72vh] overflow-hidden shadow-md">
          {/* Header indicating current assistant active mode */}
          <div className="border-b border-[var(--app-border)] bg-[var(--app-surface-solid)] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--app-text)]">
                {mode === 'assistant' && 'AI Stadium Assistant'}
                {mode === 'crowd-analysis' && 'Crowd flow analyzer'}
                {mode === 'incident-generator' && 'Incident report generator'}
                {mode === 'translate' && 'Multilingual translator'}
                {mode === 'emergency' && 'Emergency safety support'}
              </h2>
              <p className="text-xs text-[var(--app-muted)] mt-0.5">
                {mode === 'assistant' && 'Ask details about arena locations, accessibility, or food options.'}
                {mode === 'crowd-analysis' && 'Generates recommendations based on active arena crowd sensors.'}
                {mode === 'incident-generator' && 'Transforms description notes into production-ready incident logs.'}
                {mode === 'translate' && 'Translates communication messages into target languages.'}
                {mode === 'emergency' && 'Validates safety triggers and issues emergency response instructions.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>

          {/* Messages list with fixed height, internal scrolling, and custom scrollbar */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-6 bg-[var(--app-bg)]/30 chat-scroll"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-busy={isTyping || currentLoading}
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  role={message.role}
                  message={message.text}
                  timestamp={message.timestamp}
                />
              ))}
              {isTyping || currentLoading ? <TypingIndicator /> : null}
            </div>
          </div>

          {/* Fixed bottom input & suggestions panel */}
          <div className="border-t border-[var(--app-border)] bg-[var(--app-surface-solid)] p-4 space-y-4">
            {/* Suggestion Chips */}
            <div className="max-w-4xl mx-auto flex flex-wrap gap-2" aria-label="Prompt suggestions">
              {suggestionButtons.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={suggestion.action}
                  className="px-3.5 py-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-solid)] hover:bg-[var(--app-bg)] text-xs font-semibold text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>

            {/* Error alerts */}
            {errorMessage ? (
              <div
                role="alert"
                className="max-w-4xl mx-auto rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300"
              >
                {errorMessage}
              </div>
            ) : null}

            {/* Loading Gemini response indicator */}
            {currentLoading ? (
              <div className="max-w-4xl mx-auto">
                <InlineLoader label="Querying Gemini..." />
              </div>
            ) : null}

            {/* Input Form */}
            <form
              className="max-w-4xl mx-auto flex gap-3 items-end"
              onSubmit={(event) => {
                event.preventDefault()
                sendMessage(draft)
              }}
            >
              <div className="flex-1 relative">
                <label className="sr-only" htmlFor="assistant-message">
                  Enter your message
                </label>
                <textarea
                  id="assistant-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={
                    mode === 'translate'
                      ? 'Type the text you want to translate...'
                      : 'Ask StadiumPilot anything or type a directive...'
                  }
                  rows={1}
                  className="w-full min-h-[48px] max-h-[140px] resize-none rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-solid)] pl-4 pr-12 py-3.5 text-sm text-[var(--app-text)] outline-none transition-all placeholder:text-[var(--app-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)] focus:outline-none"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      if (canSend) {
                        sendMessage(draft)
                      }
                    }
                  }}
                />
              </div>
              <Button
                type="submit"
                disabled={!canSend}
                size="md"
                className="h-12 px-6 rounded-2xl font-semibold shadow-sm shrink-0 transition-transform active:scale-95"
              >
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
