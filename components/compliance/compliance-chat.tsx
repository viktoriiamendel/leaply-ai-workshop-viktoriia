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
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#0a0908] text-stone-200">
      {/* Atmosphere: warm glow + cool counter-glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70rem 45rem at 80% -15%, rgba(245,158,11,0.16), transparent 60%), radial-gradient(55rem 40rem at -12% 115%, rgba(244,114,98,0.09), transparent 55%)",
        }}
      />
      {/* Faint grid, masked toward the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(circle at 50% 0%, #000 25%, transparent 70%)",
        }}
      />
      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 85% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <header className="relative z-10 border-b border-white/[0.07] bg-white/[0.02] px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-lg shadow-amber-500/25">
            <RiShieldCheckLine className="size-4" />
          </span>
          <h1 className="font-[family-name:var(--font-editorial)] text-lg text-stone-50">
            Compliance{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent italic">
              Editor
            </span>
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
            const node =
              i.t === "creo" ? (
                <CreoBubble text={i.text} />
              ) : i.t === "refine" ? (
                <UserBubble text={i.text} />
              ) : i.t === "version" ? (
                <VersionCard reply={i.reply} text={i.text} />
              ) : i.t === "lesson" ? (
                <LessonCard markdown={i.markdown} />
              ) : (
                <div className="space-y-5">
                  <ComplianceResultView
                    result={i.result}
                    variant={variant}
                    onVariant={onVariant}
                  />
                  <Changelog original={creo} findings={i.result.findings} />
                </div>
              )
            return (
              <div
                key={i.id}
                className="animate-in duration-500 fade-in slide-in-from-bottom-3"
              >
                {node}
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

      <div className="relative z-10 border-t border-white/[0.07] bg-[#0a0908]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 pt-3 pb-4">
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
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-black/40 p-1.5 shadow-2xl shadow-black/50 transition-colors focus-within:border-amber-400/40">
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
              className="max-h-60 flex-1 resize-y bg-transparent px-2.5 py-2 text-sm leading-relaxed text-stone-100 outline-none placeholder:text-stone-600"
            />
            <button
              onClick={send}
              disabled={loading || draft.trim().length === 0}
              className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-lg shadow-amber-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
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
    <div className="relative flex min-h-[55vh] animate-in flex-col items-center justify-center px-4 text-center duration-700 fade-in slide-in-from-bottom-4">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 size-80 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[100px]"
      />
      <p className="relative mb-4 font-mono text-[11px] tracking-[0.3em] text-amber-400/80 uppercase">
        Leaply Compliance Desk
      </p>
      <h2 className="relative font-[family-name:var(--font-editorial)] text-4xl leading-[1.05] font-light text-stone-50 sm:text-5xl">
        Paste a creative.
        <br />
        <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 bg-clip-text text-transparent italic">
          We&apos;ll make it compliant.
        </span>
      </h2>
      <p className="relative mt-5 max-w-md text-sm text-stone-400">
        A compliance check, a Minimal and a Polished rewrite, the in-context
        changelog — then refine it in chat.
      </p>
      <button
        onClick={onTry}
        className="relative mt-7 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-2.5 text-sm text-amber-100 shadow-lg shadow-amber-500/10 transition hover:bg-amber-400/20 hover:shadow-amber-500/20"
      >
        <RiSparklingLine className="size-4" /> Try an example
      </button>
    </div>
  )
}
