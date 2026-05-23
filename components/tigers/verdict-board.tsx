import type { Critique } from "@/lib/schemas/critique"

import { TIGER_CONFIG, TigerPanel, type TigerKey } from "./tiger-panel"

const TIGER_ORDER: TigerKey[] = ["money_tiger", "user_tiger", "tech_tiger"]

// Verdict screen. Three tiger panels reveal in sequence with a stamp
// slam + typewriter one-liner + the tiger's long-form thinking. The
// per-dimension signal scores live in a separate Signals section
// further down so this view stays focused on the panel verdicts.
export function VerdictBoard({ critique }: { critique: Critique }) {
  const inCount = TIGER_ORDER.filter(
    (k) => critique.tiger_verdicts[k].status === "in"
  ).length
  return (
    <section className="flex flex-col gap-6">
      <AggregateHeader inCount={inCount} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TIGER_ORDER.map((key, i) => (
          <TigerPanel
            key={key}
            tigerKey={key}
            mode="verdict"
            verdict={critique.tiger_verdicts[key]}
            critique={critique.tiger_critiques[key]}
            index={i}
          />
        ))}
      </div>
    </section>
  )
}

function AggregateHeader({ inCount }: { inCount: number }) {
  const tone =
    inCount === 3
      ? { color: "#34d399", glow: "rgba(16,185,129,0.7)" }
      : inCount === 2
        ? { color: "#a7f3d0", glow: "rgba(16,185,129,0.55)" }
        : inCount === 1
          ? { color: "#fcd34d", glow: "rgba(245,158,11,0.55)" }
          : { color: "#fca5a5", glow: "rgba(239,68,68,0.55)" }
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h2
        className="font-display text-2xl uppercase sm:text-3xl"
        style={{
          color: tone.color,
          textShadow: `0 0 12px ${tone.glow}, 0 0 28px ${tone.glow}`,
        }}
      >
        🐯 {inCount} of 3 tigers would invest
      </h2>
      <p className="font-retro-mono text-sm tracking-widest text-zinc-500 uppercase">
        Independent votes &mdash; disagreement is realistic
      </p>
    </div>
  )
}

// Re-export so other components can read tiger metadata without
// importing tiger-panel directly.
export { TIGER_CONFIG }
