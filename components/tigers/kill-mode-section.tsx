import { RiCompass3Line, RiSkullLine } from "@remixicon/react"

import { Card } from "@/components/ui/card"
import type { KillMode } from "@/lib/schemas/critique"
import { bandFromScore } from "@/lib/scoring"

// Two-mode section.
//
// For KILL band (score < 30): full "Why this should die" block + pivots.
// This is the honest case to walk away — designed to save the founder
// 6 months they would otherwise sink into a bad bet.
//
// For PROBE/MINIMAL/SHIP bands: just the pivots, framed as "Adjacent
// directions worth exploring." Useful even for strong ideas — the
// founder might see a better adjacent market.
export function KillModeSection({
  killMode,
  score,
}: {
  killMode: KillMode
  score: number
}) {
  const band = bandFromScore(score)
  const showWhyDie = band === "kill"
  const pivotsHeader =
    band === "kill"
      ? "🔄 If you walk away — adjacent ideas"
      : "🔄 Adjacent ideas worth exploring"

  return (
    <div className="flex flex-col gap-4">
      {showWhyDie ? <WhyDie text={killMode.why_die} /> : null}
      <Pivots pivots={killMode.suggested_pivots} header={pivotsHeader} />
    </div>
  )
}

function WhyDie({ text }: { text: string }) {
  return (
    <Card className="border-red-500/50 bg-red-950/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <RiSkullLine className="size-5 text-red-300" aria-hidden />
        <h2
          className="font-display text-lg tracking-widest text-red-200 uppercase"
          style={{ textShadow: "0 0 14px rgba(239,68,68,0.55)" }}
        >
          Why this should die
        </h2>
      </div>
      <p className="text-base leading-relaxed text-zinc-100">{text}</p>
    </Card>
  )
}

function Pivots({
  pivots,
  header,
}: {
  pivots: KillMode["suggested_pivots"]
  header: string
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/70 p-5">
      <div className="mb-3 flex items-center gap-2">
        <RiCompass3Line className="size-5 text-pink-300" aria-hidden />
        <h2
          className="font-display text-lg tracking-widest text-pink-200 uppercase"
          style={{ textShadow: "0 0 14px rgba(236,72,153,0.45)" }}
        >
          {header}
        </h2>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {pivots.map((p, i) => (
          <li
            key={i}
            className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3"
          >
            <div className="flex items-start gap-2">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full border border-pink-500/50 bg-pink-500/10 font-display text-xs text-pink-200"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="text-sm leading-snug font-semibold text-zinc-100">
                {p.direction}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{p.rationale}</p>
          </li>
        ))}
      </ol>
    </Card>
  )
}
