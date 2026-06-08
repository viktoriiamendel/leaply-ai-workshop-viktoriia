"use client"

import { useEffect, useState } from "react"
import {
  RiShieldCheckLine,
  RiLoader4Line,
  RiCheckLine,
  RiSparklingLine,
} from "@remixicon/react"

import { requestComplianceCheck } from "@/lib/compliance-client"
import type { ComplianceResult } from "@/lib/schemas/compliance"
import {
  ComplianceResultView,
  type Variant,
} from "@/components/compliance/compliance-result"
import { RulesChecklist } from "@/components/compliance/rules-checklist"
import { RefineChat } from "@/components/compliance/refine-chat"

const STEPS = [
  "Reading the creative",
  "Checking medical & diagnostic claims",
  "Checking overpromising & fixed timeframes",
  "Checking doctor / expert framing",
  "Checking urgency, personalization & user counts",
  "Recommending disclaimers",
  "Writing the compliant version",
]

const SAMPLE = `TOMORROW MORNING. We're starting the 28-day fascia + lymphatic protocol. For women whose lower belly feels heavy and whose back aches after sitting all day. If you try to stand straight, but your stomach still sticks out — your pelvic fascia is locked. It's not fat, it's trapped fluid. Just 7 minutes a day. No gym. No diets. Just the printable release routine. Your hips will open. Your lymph will move. Your body will feel light again. TAP THE SCREEN TO JOIN`

export function ComplianceEditor() {
  const [creo, setCreo] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [checkedCreo, setCheckedCreo] = useState("")
  const [variant, setVariant] = useState<Variant>("polished")
  const [step, setStep] = useState(0)

  const canSubmit = creo.trim().length >= 10 && !loading

  // Advance the analysis steps while the request is in flight.
  useEffect(() => {
    if (!loading) return
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 2200)
    return () => clearInterval(id)
  }, [loading])

  async function onCheck() {
    setStep(0)
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const text = creo
      setResult(await requestComplianceCheck(text))
      setCheckedCreo(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Input */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <label className="font-mono text-[11px] tracking-[0.2em] text-stone-400 uppercase">
              Creative
            </label>
            <button
              onClick={() => setCreo(SAMPLE)}
              className="inline-flex items-center gap-1 text-xs text-amber-400/80 transition hover:text-amber-300"
            >
              <RiSparklingLine className="size-3.5" /> Try an example
            </button>
          </div>
          <textarea
            value={creo}
            onChange={(e) => setCreo(e.target.value)}
            placeholder="Paste the creative here — storytell, script, or copy…"
            className="min-h-72 w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-400/40"
          />
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={onCheck}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RiLoader4Line className="size-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <RiShieldCheckLine className="size-4" /> Run compliance check
                </>
              )}
            </button>
            <span className="font-mono text-[11px] text-stone-600">
              {creo.trim().length} chars
            </span>
          </div>
          {error && (
            <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="min-h-72">
        {loading ? (
          <AnalyzingPanel step={step} />
        ) : result ? (
          <div className="space-y-5">
            <ComplianceResultView
              result={result}
              variant={variant}
              onVariant={setVariant}
            />
            <RulesChecklist findings={result.findings} />
            <RefineChat
              key={checkedCreo + variant}
              creo={checkedCreo}
              initialCompliant={
                variant === "minimal"
                  ? result.compliantMinimal
                  : result.compliantPolished
              }
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function AnalyzingPanel({ step }: { step: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
      <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-amber-400/90 uppercase">
        Analyzing against the ruleset
      </p>
      <ul className="space-y-2.5">
        {STEPS.map((label, i) => {
          const done = i < step
          const active = i === step
          return (
            <li
              key={label}
              className={`flex items-center gap-3 text-sm transition ${
                done
                  ? "text-stone-400"
                  : active
                    ? "text-stone-100"
                    : "text-stone-600"
              }`}
            >
              <span className="flex size-5 items-center justify-center">
                {done ? (
                  <RiCheckLine className="size-4 text-emerald-400" />
                ) : active ? (
                  <RiLoader4Line className="size-4 animate-spin text-amber-400" />
                ) : (
                  <span className="size-1.5 rounded-full bg-stone-700" />
                )}
              </span>
              {label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
      <RiShieldCheckLine className="mb-3 size-7 text-stone-700" />
      <p className="max-w-xs text-sm text-stone-500">
        Your compliant rewrite, the analysis, and a full breakdown of every rule
        we checked will appear here.
      </p>
    </div>
  )
}
