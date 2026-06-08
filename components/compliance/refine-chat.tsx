"use client"

import { useState } from "react"
import {
  RiCheckLine,
  RiFileCopyLine,
  RiLoader4Line,
  RiSendPlaneFill,
  RiChat3Line,
  RiLightbulbFlashLine,
} from "@remixicon/react"

import {
  requestComplianceRefine,
  requestComplianceLesson,
} from "@/lib/compliance-client"
import type { ChatMessage } from "@/lib/schemas/compliance"

export function RefineChat({
  creo,
  initialCompliant,
}: {
  creo: string
  initialCompliant: string
}) {
  const [current, setCurrent] = useState(initialCompliant)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [lesson, setLesson] = useState<string | null>(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [lessonCopied, setLessonCopied] = useState(false)

  async function saveLesson() {
    if (lessonLoading || messages.length === 0) return
    setLessonLoading(true)
    setError(null)
    try {
      const res = await requestComplianceLesson({
        creo,
        compliantText: current,
        messages,
      })
      setLesson(res.markdown)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLessonLoading(false)
    }
  }

  async function copyLesson() {
    if (!lesson) return
    try {
      await navigator.clipboard.writeText(lesson)
      setLessonCopied(true)
      setTimeout(() => setLessonCopied(false), 2000)
    } catch {
      // ignore — user can select manually
    }
  }

  async function send() {
    const text = draft.trim()
    if (!text || loading) return
    const next: ChatMessage[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setDraft("")
    setError(null)
    setLoading(true)
    try {
      const res = await requestComplianceRefine({
        creo,
        compliantText: current,
        messages: next,
      })
      setCurrent(res.compliantText)
      setMessages([...next, { role: "assistant", content: res.reply }])
    } catch (err) {
      setMessages(messages) // roll back the optimistic user message
      setDraft(text)
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(current)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore — user can select manually
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RiChat3Line className="size-4 text-amber-300" />
          <h2 className="font-[family-name:var(--font-editorial)] text-xl text-stone-100">
            Refine with AI
          </h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={saveLesson}
            disabled={lessonLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-amber-400/20 disabled:opacity-40"
          >
            {lessonLoading ? (
              <RiLoader4Line className="size-3.5 animate-spin" />
            ) : (
              <RiLightbulbFlashLine className="size-3.5" />
            )}
            Save as lesson
          </button>
        )}
      </div>

      {/* Distilled lesson to teach the rulebook */}
      {lesson && (
        <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-wider text-amber-300/90 uppercase">
              Lesson — paste to your skill maintainer
            </span>
            <button
              onClick={copyLesson}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-stone-200 transition hover:bg-white/10"
            >
              {lessonCopied ? (
                <>
                  <RiCheckLine className="size-3.5" /> Copied
                </>
              ) : (
                <>
                  <RiFileCopyLine className="size-3.5" /> Copy
                </>
              )}
            </button>
          </div>
          <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-stone-200">
            {lesson}
          </pre>
        </div>
      )}

      {/* Always-current version */}
      <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.03] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-wider text-emerald-300/80 uppercase">
            Current version
          </span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-stone-200 transition hover:bg-white/10"
          >
            {copied ? (
              <>
                <RiCheckLine className="size-3.5" /> Copied
              </>
            ) : (
              <>
                <RiFileCopyLine className="size-3.5" /> Copy
              </>
            )}
          </button>
        </div>
        <p className="font-[family-name:var(--font-editorial)] text-[15px] leading-relaxed whitespace-pre-wrap text-stone-100">
          {current}
        </p>
      </div>

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="mb-4 space-y-2.5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <p
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-amber-400/15 text-amber-100"
                    : "bg-white/5 text-stone-300"
                }`}
              >
                {m.content}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <p className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3.5 py-2 text-sm text-stone-400">
                <RiLoader4Line className="size-4 animate-spin text-amber-400" />
                Refining…
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {/* Input */}
      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          rows={2}
          placeholder="Ask for a change — e.g. “shorten the CTA”, “keep the word protocol”, “this line still sounds diagnostic”…"
          className="min-h-11 flex-1 resize-y rounded-xl border border-white/10 bg-black/30 p-3 text-sm leading-relaxed text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-400/40"
        />
        <button
          onClick={send}
          disabled={loading || draft.trim().length === 0}
          className="inline-flex size-11 items-center justify-center rounded-xl bg-amber-400 text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send"
        >
          {loading ? (
            <RiLoader4Line className="size-5 animate-spin" />
          ) : (
            <RiSendPlaneFill className="size-5" />
          )}
        </button>
      </div>
    </section>
  )
}
