import { RiTargetLine, RiFlaskLine, RiAlertLine } from "@remixicon/react"

import { Card } from "@/components/ui/card"
import type { RiskiestAssumption } from "@/lib/schemas/critique"

// "Riskiest assumptions" UI block. Sits between Signals and Weakest Link.
// Each card is a 3-part story:
//   ASSUMPTION (bold) → WHY RISKY (muted) → CHEAP TEST (emerald accent).
// The cheap test is the highest-value element on the page — call it
// out visually so the founder can scan straight to it.
export function AssumptionsSection({
  assumptions,
}: {
  assumptions: RiskiestAssumption[]
}) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2">
        <h2
          className="font-display text-lg tracking-widest text-orange-200 uppercase"
          style={{ textShadow: "0 0 14px rgba(255,107,0,0.45)" }}
        >
          🎯 Riskiest Assumptions to Test First
        </h2>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {assumptions.map((a, i) => (
          <AssumptionCard key={i} index={i} assumption={a} />
        ))}
      </div>
    </section>
  )
}

function AssumptionCard({
  index,
  assumption,
}: {
  index: number
  assumption: RiskiestAssumption
}) {
  return (
    <Card className="flex flex-col gap-3 border-zinc-800 bg-zinc-900/70 p-4">
      <div className="flex items-center gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-red-500/50 bg-red-500/10 font-display text-sm text-red-200"
          aria-hidden
        >
          {index + 1}
        </span>
        <span className="font-retro-mono text-xs tracking-widest text-zinc-500 uppercase">
          Assumption
        </span>
      </div>

      <p className="text-sm leading-snug font-semibold text-zinc-100">
        {assumption.assumption}
      </p>

      <div className="flex gap-2">
        <RiAlertLine className="mt-0.5 size-4 shrink-0 text-amber-300" />
        <p className="text-sm text-zinc-400">{assumption.why_risky}</p>
      </div>

      <div className="mt-auto flex gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3">
        <RiFlaskLine className="mt-0.5 size-4 shrink-0 text-emerald-300" />
        <div className="flex flex-col gap-1">
          <span className="font-retro-mono text-[10px] tracking-widest text-emerald-300 uppercase">
            Cheap test
          </span>
          <p className="text-sm leading-snug text-emerald-100">
            {assumption.cheap_test}
          </p>
        </div>
      </div>

      {/* Aria-only label, screen-reader friendly. */}
      <RiTargetLine className="sr-only" aria-hidden />
    </Card>
  )
}
