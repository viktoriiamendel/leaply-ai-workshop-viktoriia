"use client"

import { useState } from "react"
import { RiCheckLine, RiFileCopyLine, RiLoader4Line } from "@remixicon/react"

export const STEPS = [
  "Reading the creative",
  "Checking medical & diagnostic claims",
  "Checking overpromising & fixed timeframes",
  "Checking doctor / expert framing",
  "Checking urgency, personalization & user counts",
  "Recommending disclaimers",
  "Writing the two versions",
]

export function CopyChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }
  return (
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
  )
}

// The user's pasted creative.
export function CreoBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[90%] rounded-2xl rounded-br-sm border border-white/10 bg-white/[0.06] px-4 py-3">
        <p className="mb-1 font-mono text-[10px] tracking-wider text-stone-500 uppercase">
          Creative
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-stone-200">
          {text}
        </p>
      </div>
    </div>
  )
}

// A refine request from the user.
export function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-amber-400/15 px-3.5 py-2 text-sm leading-relaxed text-amber-100">
        {text}
      </p>
    </div>
  )
}

// An assistant turn: a refined version + a short note.
export function VersionCard({ reply, text }: { reply: string; text: string }) {
  return (
    <div className="space-y-2">
      {reply && (
        <p className="text-sm leading-relaxed text-stone-400">{reply}</p>
      )}
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-wider text-emerald-300/80 uppercase">
            Updated version
          </span>
          <CopyChip text={text} />
        </div>
        <p className="font-[family-name:var(--font-editorial)] text-[16px] leading-relaxed whitespace-pre-wrap text-stone-100">
          {text}
        </p>
      </div>
    </div>
  )
}

export function LessonCard({ markdown }: { markdown: string }) {
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wider text-amber-300/90 uppercase">
          Lesson — paste to your skill maintainer
        </span>
        <CopyChip text={markdown} />
      </div>
      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-stone-200">
        {markdown}
      </pre>
    </div>
  )
}

export function AnalyzingPanel({ step }: { step: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
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
              className={`flex items-center gap-3 text-sm ${
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
