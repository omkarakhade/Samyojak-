'use client'
import { useState, useRef, useEffect } from 'react'
import { Brain, X, Send, Minimize2, Maximize2 } from 'lucide-react'

interface Message {
  role: 'user' | 'ai'
  content: string
}

const QUICK_QUESTIONS = [
  'How is my business doing?',
  'Which leads should I focus on today?',
  'Show me my revenue summary',
  'Any urgent items I should know?',
  'How can I get more customers?',
]

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: '👋 Hi! I am your Samyojak AI assistant. I can see your real business data — leads, invoices, inventory, and more. Ask me anything!'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (message: string) => {
    if (!message.trim() || loading) return
    const userMsg = message.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.reply || 'Sorry, I could not get a response. Try again.'
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '⚠️ Could not connect to AI. Check your GROQ_API_KEY in Vercel.'
      }])
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        style={{ background: '#8B5CF6', border: '3px solid #1E293B', boxShadow: '4px 4px 0px #1E293B' }}
        aria-label="Open AI Assistant"
      >
        <Brain size={24} />
      </button>
    )
  }

  return (
    <div
      className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-80 md:w-96 rounded-2xl overflow-hidden"
      style={{ border: '2px solid #1E293B', boxShadow: '8px 8px 0px #8B5CF6' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4" style={{ background: '#0F172A' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#8B5CF6' }}>
          <Brain size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm" style={{ fontFamily: 'Outfit' }}>Samyojak AI</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
            <p className="text-xs text-green-400">Reading your live data</p>
          </div>
        </div>
        <button onClick={() => setMinimized(!minimized)} className="p-1 text-white/40 hover:text-white">
          {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
        <button onClick={() => setOpen(false)} className="p-1 text-white/40 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2" style={{ background: '#F8FAFC' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? '#8B5CF6' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1E293B',
                    border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                    fontFamily: 'Plus Jakarta Sans',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-sm bg-white border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 flex gap-1 overflow-x-auto" style={{ background: '#F1F5F9' }}>
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap hover:opacity-80 flex-shrink-0"
                style={{ background: '#EDE9FE', color: '#8B5CF6', border: '1px solid #8B5CF6' }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3" style={{ background: 'white', borderTop: '1px solid #E2E8F0' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask about your business..."
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid #E2E8F0', fontFamily: 'Plus Jakarta Sans' }}
              onFocus={e => e.target.style.borderColor = '#8B5CF6'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl text-white disabled:opacity-40"
              style={{ background: '#8B5CF6' }}
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
