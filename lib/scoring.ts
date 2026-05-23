import type { Signals } from "@/lib/schemas/critique"

// One of four action bands. Drives the headline, the CTA, and whether
// we show the kill-mode section vs the fail-cheap mitigation tab.
export type ActionBand = "kill" | "probe" | "minimal" | "ship"

export type BandMeta = {
  band: ActionBand
  label: string // 8-12 char headline word
  headline: string // one-line prescription
  ctaLabel: string // primary CTA text
  ctaAction:
    | "scroll-to-kill-mode"
    | "scroll-to-assumptions"
    | "generate-ship-it"
    | "scroll-to-ship-it"
  // Hex colors used by the band hero and CTA gradient. UI/styling sub-
  // systems can pick whichever they need.
  primary: string
  glow: string
}

// Dimension weights for derived overall score. Demand carries the most
// weight — if nobody wants it, the rest doesn't matter. Acquisition and
// competitive are tied: a great pitch with no distribution dies just as
// fast as one stuck against monopoly incumbents.
const WEIGHTS = { demand: 0.4, acquisition: 0.3, competitive: 0.3 } as const

/**
 * Computes the overall verdict score from the three dimension scores,
 * rounded to an integer in [0, 100]. This replaces whatever the model
 * itself returned — guaranteeing the headline number is consistent with
 * the per-dimension cards the user sees below it.
 */
export function deriveOverallScore(signals: Signals): number {
  const raw =
    signals.demand.score * WEIGHTS.demand +
    signals.acquisition.score * WEIGHTS.acquisition +
    signals.competitive.score * WEIGHTS.competitive
  return Math.max(0, Math.min(100, Math.round(raw)))
}

/**
 * Maps a score 0-100 to a four-band action. Boundaries are inclusive of
 * the lower bound: 0-29 KILL, 30-49 PROBE, 50-69 MINIMAL, 70-100 SHIP.
 */
export function bandFromScore(score: number): ActionBand {
  if (score < 30) return "kill"
  if (score < 50) return "probe"
  if (score < 70) return "minimal"
  return "ship"
}

const BAND_META: Record<ActionBand, BandMeta> = {
  kill: {
    band: "kill",
    label: "KILL",
    headline: "Don't build this. Walk away or pivot.",
    ctaLabel: "See why this should die",
    ctaAction: "scroll-to-kill-mode",
    primary: "#ef4444",
    glow: "rgba(239, 68, 68, 0.85)",
  },
  probe: {
    band: "probe",
    label: "PROBE",
    headline:
      "Don't build yet. Run the cheapest 7-day test before you invest more.",
    ctaLabel: "Show me the test plan",
    ctaAction: "scroll-to-assumptions",
    primary: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.8)",
  },
  minimal: {
    band: "minimal",
    label: "BUILD MINIMAL",
    headline:
      "Ship a fail-cheap version. Hold yourself to kill criteria before scaling.",
    ctaLabel: "Plan a minimal launch",
    ctaAction: "scroll-to-ship-it",
    primary: "#facc15",
    glow: "rgba(250, 204, 21, 0.7)",
  },
  ship: {
    band: "ship",
    label: "SHIP IT",
    headline: "The pitch holds up. Generate the launch pack and execute.",
    ctaLabel: "Generate Ship It Pack",
    ctaAction: "generate-ship-it",
    primary: "#10b981",
    glow: "rgba(16, 185, 129, 0.85)",
  },
}

export function bandMeta(band: ActionBand): BandMeta {
  return BAND_META[band]
}

export function bandMetaForScore(score: number): BandMeta {
  return BAND_META[bandFromScore(score)]
}
