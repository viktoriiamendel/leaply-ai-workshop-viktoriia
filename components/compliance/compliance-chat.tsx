"use client"

import { useEffect, useRef, useState } from "react"
import {
  RiShieldCheckLine,
  RiLoader4Line,
  RiSendPlaneFill,
  RiSparklingLine,
  RiLightbulbFlashLine,
} from "@remixicon/react"

import {
  requestComplianceCheck,
  requestComplianceRefine,
  requestComplianceLesson,
} from "@/lib/compliance-client"
import type { ComplianceResult, ChatMessage } from "@/lib/schemas/compliance"
import {
  ComplianceResultView,
  type Variant,
} from "@/components/compliance/compliance-result"
import { Changelog } from "@/components/compliance/changelog"
import {
  STEPS,
  CreoBubble,
  UserBubble,
  VersionCard,
  LessonCard,
  AnalyzingPanel,
} from "@/components/compliance/chat-items"

const SAMPLE = `TOMORROW MORNING. We're starting the 28-day fascia + lymphatic protocol. For women whose lower belly feels heavy and whose back aches after sitting all day. If you try to stand straight, but your stomach still sticks out — your pelvic fascia is locked. It's not fat, it's trapped fluid. Just 7 minutes a day. No gym. No diets. Your hips will open. Your lymph will move. TAP THE SCREEN TO JOIN`

type Item =
  | { id: number; t: "creo"; text: string }
  | { id: number; t: "result"; result: ComplianceResult }
  | { id: number; t: "refine"; text: string }
  | { id: number; t: "version"; reply: string; text: string }
  | { id: number; t: "lesson"; markdown: string }

export function ComplianceChat() {
  const [items, setItems] = useState<Item[]>([])
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [creo, setCreo] = useState("")
  const [variant, setVariant] = useState<Variant>("polished")
  const [working, setWorking] = useState("")
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const idRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const nextId = () => (idRef.current += 1)

  const hasResult = result !== null
  const hasRefine = items.some((i) => i.t === "refine")

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [items.length, loading])

  useEffect(() => {
    if (!loading || hasResult) return
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      2000
    )
    return () => clearInterval(id)
  }, [loading, hasResult])

  function refineMessages(extra: ChatMessage[]): ChatMessage[] {
    const msgs: ChatMessage[] = []
    for (const i of items) {
      if (i.t === "refine") msgs.push({ role: "user", content: i.text })
      else if (i.t === "version")
        msgs.push({ role: "assistant", content: i.reply })
    }
    return [...msgs, ...extra]
  }

  function onVariant(v: Variant) {
    setVariant(v)
    if (!hasRefine && result)
      setWorking(
        v === "minimal" ? result.compliantMinimal : result.compliantPolished
      )
  }

  async function send() {
    const text = draft.trim()
    if (!text || loading) return
    setDraft("")
    setError(null)

    if (!hasResult) {
      setItems((p) => [...p, { id: nextId(), t: "creo", text }])
      setCreo(text)
      setStep(0)
      setLoading(true)
      try {
        const r = await requestComplianceCheck(text)
        setResult(r)
        setWorking(r.compliantPolished)
        setItems((p) => [...p, { id: nextId(), t: "result", result: r }])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.")
      } finally {
        setLoading(false)
      }
      return
    }

    setItems((p) => [...p, { id: nextId(), t: "refine", text }])
    setLoading(true)
    try {
      const res = await requestComplianceRefine({
        creo,
        compliantText: working,
        messages: refineMessages([{ role: "user", content: text }]),
      })
      setWorking(res.compliantText)
      setItems((p) => [
        ...p,
        {
          id: nextId(),
          t: "version",
          reply: res.reply,
          text: res.compliantText,
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  async function saveLesson() {
    if (lessonLoading || !hasResult) return
    setLessonLoading(true)
    setError(null)
    try {
      const res = await requestComplianceLesson({
        creo,
        compliantText: working,
        messages: refineMessages([]),
      })
      setItems((p) => [
        ...p,
        { id: nextId(), t: "lesson", markdown: res.markdown },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLessonLoading(false)
    }
  }

  return (
    <div className="relative flex h-screen flex-col bg-[#0c0a09] text-stone-200">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 40rem at 70% -10%, rgba(245,158,11,0.08), transparent 60%)",
        }}
      />
      <header className="relative z-10 border-b border-white/10 px-5 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <RiShieldCheckLine className="size-4 text-amber-400" />
          <h1 className="font-[family-name:var(--font-editorial)] text-lg text-stone-50">
            Compliance <span className="text-amber-400 italic">Editor</span>
          </h1>
          <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-stone-600 uppercase">
            FTC/FDA Wellness
          </span>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
          {items.length === 0 && !loading && (
            <EmptyHero onTry={() => setDraft(SAMPLE)} />
          )}

          {items.map((i) => {
            if (i.t === "creo") return <CreoBubble key={i.id} text={i.text} />
            if (i.t === "refine") return <UserBubble key={i.id} text={i.text} />
            if (i.t === "version")
              return <VersionCard key={i.id} reply={i.reply} text={i.text} />
            if (i.t === "lesson")
              return <LessonCard key={i.id} markdown={i.markdown} />
            return (
              <div key={i.id} className="space-y-5">
                <ComplianceResultView
                  result={i.result}
                  variant={variant}
                  onVariant={onVariant}
                />
                <Changelog original={creo} findings={i.result.findings} />
              </div>
            )
          })}

          {loading && !hasResult && <AnalyzingPanel step={step} />}
          {loading && hasResult && (
            <p className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3.5 py-2 text-sm text-stone-400">
              <RiLoader4Line className="size-4 animate-spin text-amber-400" />{" "}
              Refining…
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-[#0c0a09]/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {hasRefine && (
            <button
              onClick={saveLesson}
              disabled={lessonLoading}
              className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200 transition hover:bg-amber-400/20 disabled:opacity-40"
            >
              {lessonLoading ? (
                <RiLoader4Line className="size-3.5 animate-spin" />
              ) : (
                <RiLightbulbFlashLine className="size-3.5" />
              )}
              Save as lesson
            </button>
          )}
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
              rows={hasResult ? 2 : 4}
              placeholder={
                hasResult
                  ? "Ask for a change — “shorter”, “warmer”, “keep the word protocol”…"
                  : "Paste the creative here — storytell, script, or copy…"
              }
              className="max-h-60 flex-1 resize-y rounded-xl border border-white/10 bg-black/30 p-3 text-sm leading-relaxed text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-400/40"
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
        </div>
      </div>
    </div>
  )
}

function EmptyHero({ onTry }: { onTry: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <h2 className="font-[family-name:var(--font-editorial)] text-3xl text-stone-100">
        Paste a creative to check
      </h2>
      <p className="mt-3 max-w-md text-sm text-stone-400">
        Get a compliance check, a Minimal and a Polished compliant rewrite, the
        in-context changelog — then refine it in chat.
      </p>
      <button
        onClick={onTry}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-200 transition hover:bg-amber-400/20"
      >
        <RiSparklingLine className="size-4" /> Try an example
      </button>
    </div>
  )
}
