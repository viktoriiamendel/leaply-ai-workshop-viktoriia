"use client"

import {
  RiArrowDownLine,
  RiFlaskLine,
  RiRocketLine,
  RiSkullLine,
  RiToolsLine,
} from "@remixicon/react"

import { bandMetaForScore, type ActionBand } from "@/lib/scoring"

// The action-band hero is the FIRST thing the founder reads. It maps the
// derived score onto one of four prescriptive bands (KILL / PROBE /
// BUILD MINIMAL / SHIP IT) and gives the founder a single primary CTA
// that jumps to the relevant section. The card hierarchy below stays
// the same, but this header makes the "what do I do next" answer
// unmissable.
export function ActionBandHero({ score }: { score: number }) {
  const meta = bandMetaForScore(score)

  // CTA target: where we scroll to / fire when the user clicks.
  const ctaHref =
    meta.ctaAction === "scroll-to-kill-mode"
      ? "#kill-mode"
      : meta.ctaAction === "scroll-to-assumptions"
        ? "#assumptions"
        : "#ship-it"

  return (
    <section
      className="relative overflow-hidden rounded-lg border-2 p-5 sm:p-7"
      style={{
        borderColor: meta.primary,
        backgroundColor: "rgba(10, 5, 7, 0.85)",
        boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 40px -8px ${meta.glow}`,
      }}
    >
      {/* Soft radial wash in the band color. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${meta.glow}, transparent 65%)`,
          opacity: 0.35,
        }}
      />

      <div className="relative flex flex-col items-center gap-4 text-center sm:gap-5">
        <div className="flex items-center gap-3">
          <BandIcon band={meta.band} color={meta.primary} />
          <h1
            className="font-display text-4xl tracking-[0.06em] uppercase sm:text-5xl md:text-6xl"
            style={{
              color: meta.primary,
              textShadow: `0 0 18px ${meta.glow}, 0 0 38px ${meta.glow}`,
            }}
          >
            {meta.label}
          </h1>
        </div>

        <p className="max-w-xl text-base text-zinc-100 sm:text-lg">
          {meta.headline}
        </p>

        <div className="font-retro-mono text-sm tracking-widest text-zinc-400 uppercase">
          Score: <span className="text-zinc-100">{score}</span>
          <span className="text-zinc-500"> / 100</span>
        </div>

        <a
          href={ctaHref}
          className="group inline-flex items-center gap-2 rounded-md px-5 py-3 font-display tracking-widest uppercase transition-transform hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${meta.primary}, ${meta.glow})`,
            color: "#0a0507",
            boxShadow: `0 0 24px -4px ${meta.glow}`,
          }}
        >
          <span>{meta.ctaLabel}</span>
          <RiArrowDownLine className="size-4 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  )
}

// Maps the action band to its icon. Rendered as static JSX per band so
// React's static-components rule stays happy — components can't be
// resolved from a runtime function reference.
function BandIcon({ band, color }: { band: ActionBand; color: string }) {
  const cls = "size-10 sm:size-12"
  const style = { color }
  switch (band) {
    case "kill":
      return <RiSkullLine className={cls} style={style} aria-hidden />
    case "probe":
      return <RiFlaskLine className={cls} style={style} aria-hidden />
    case "minimal":
      return <RiToolsLine className={cls} style={style} aria-hidden />
    case "ship":
      return <RiRocketLine className={cls} style={style} aria-hidden />
  }
}
