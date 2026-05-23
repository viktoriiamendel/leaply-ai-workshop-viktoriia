"use client"

import { useState } from "react"
import { RiArrowDownSLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Critique } from "@/lib/schemas/critique"

import { CritiqueResult } from "./critique-result"

// One variant re-analysis. By default we show the headline numbers —
// new score with delta vs the original, the 3 tiger verdicts in a row,
// and the verdict summary. Clicking "See full" expands the entire
// one-pager below it.
export function VariantCard({
  label,
  variantInput,
  critique,
  originalScore,
}: {
  label: string
  variantInput: string
  critique: Critique
  originalScore: number
}) {
  const [expanded, setExpanded] = useState(false)
  const delta = critique.verdict_score - originalScore
  const deltaTone =
    delta > 0
      ? "text-emerald-300"
      : delta < 0
        ? "text-red-300"
        : "text-zinc-400"
  const deltaSign = delta > 0 ? "+" : delta < 0 ? "" : "±"

  return (
    <Card className="border-zinc-800 bg-zinc-900/70 p-5">
      <header className="flex flex-col gap-2">
        <Badge
          variant="outline"
          className="self-start border-pink-500/50 bg-pink-500/10 font-display tracking-widest text-pink-200 uppercase"
        >
          Variant
        </Badge>
        <h3
          className="font-display text-xl tracking-wide text-zinc-50 uppercase sm:text-2xl"
          style={{ textShadow: "0 0 12px rgba(236,72,153,0.4)" }}
        >
          {label}
        </h3>
        <p className="font-retro-mono text-sm text-zinc-400">
          Compared with the original idea
        </p>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="rounded-md border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-center">
          <div className="font-display text-3xl text-zinc-100">
            {critique.verdict_score}
          </div>
          <div className="mt-1 font-retro-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            New score
          </div>
        </div>
        <div
          className={`font-display text-2xl tracking-wide ${deltaTone}`}
          aria-label={`Delta versus original: ${deltaSign}${delta}`}
        >
          {deltaSign}
          {delta}
        </div>
        <p className="min-w-0 flex-1 text-sm text-zinc-200">
          {critique.verdict_summary}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MiniVerdict
          emoji="💰"
          name="Money"
          status={critique.tiger_verdicts.money_tiger.status}
        />
        <MiniVerdict
          emoji="🤔"
          name="User"
          status={critique.tiger_verdicts.user_tiger.status}
        />
        <MiniVerdict
          emoji="⚙️"
          name="Tech"
          status={critique.tiger_verdicts.tech_tiger.status}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 w-full border-zinc-800 bg-zinc-950/40 font-display tracking-widest text-zinc-200 uppercase hover:bg-zinc-900"
      >
        <RiArrowDownSLine
          className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
        {expanded ? "Hide full variant analysis" : "See full variant analysis"}
      </Button>

      {expanded ? (
        <div className="mt-5 border-t border-zinc-800 pt-5">
          <CritiqueResult critique={critique} pitch={variantInput} />
        </div>
      ) : null}
    </Card>
  )
}

function MiniVerdict({
  emoji,
  name,
  status,
}: {
  emoji: string
  name: string
  status: "in" | "cautious" | "out"
}) {
  const cfg = {
    in: {
      label: "IN",
      cls: "border-emerald-500/50 bg-emerald-500/10 text-emerald-200",
    },
    cautious: {
      label: "CAUTIOUS",
      cls: "border-amber-500/50 bg-amber-500/10 text-amber-200",
    },
    out: { label: "OUT", cls: "border-red-500/50 bg-red-500/10 text-red-200" },
  }[status]
  return (
    <div
      className={`flex items-center justify-between rounded border px-3 py-2 ${cfg.cls}`}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden>{emoji}</span>
        <span className="font-retro-mono text-sm tracking-widest uppercase">
          {name}
        </span>
      </span>
      <span className="font-display text-sm tracking-widest uppercase">
        {cfg.label}
      </span>
    </div>
  )
}
