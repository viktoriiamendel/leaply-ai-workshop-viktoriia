"use client"

import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import type { TigerVerdict } from "@/lib/schemas/critique"

import {
  CARD_ACCENT,
  KanjiWatermark,
  RankMarker,
  SawtoothBand,
} from "./tiger-card-frame"
import { TigerCharacter, type TigerKey } from "./tiger-character"
import { TigerNamePlate, TigerThinking } from "./tiger-panel-basis"
import { CardFlash, LoadingDots, Stamp, STATUS_CONFIG } from "./tiger-panel-fx"
import { Typewriter } from "./typewriter"

// Re-export so other modules can use the same key type.
export type { TigerKey }

type TigerConfig = {
  name: string
  tagline: string
}

export const TIGER_CONFIG: Record<TigerKey, TigerConfig> = {
  money_tiger: { name: "Money Tiger", tagline: "The Investor" },
  user_tiger: { name: "User Tiger", tagline: "The Skeptic" },
  tech_tiger: { name: "Tech Tiger", tagline: "The Builder" },
}

type Props = {
  tigerKey: TigerKey
  mode: "idle" | "loading" | "verdict"
  verdict?: TigerVerdict
  // Long-form `tiger_critiques.X` text shown in "Thinking" block under
  // the verdict. Dimension scores live in the separate Signals section.
  critique?: string
  // 0-based stagger index. Drives animation-delays so each tiger
  // arrives a beat apart.
  index?: number
}

// One tarot-style card per tiger. The outer wrapper carries the animated
// neon halo; the inner frame is aged parchment with crimson/gold ornate
// borders, kanji watermark, and corner rank markers. The tiger character
// sits in the middle, with verdict elements overlaid on top.
export function TigerPanel({
  tigerKey,
  mode,
  verdict,
  critique,
  index = 0,
}: Props) {
  const config = TIGER_CONFIG[tigerKey]
  const accent = CARD_ACCENT[tigerKey]
  const stagger = index * 400

  // Halo color picks up status on verdict, otherwise persona neon.
  const haloColor =
    mode === "verdict" && verdict
      ? STATUS_CONFIG[verdict.status].glow
      : accent.neon

  const haloAnim =
    mode === "loading"
      ? "tigerGlowLoading 1.2s ease-in-out infinite"
      : mode === "idle"
        ? "tigerGlow 2.4s ease-in-out infinite"
        : undefined

  const outerStyle = {
    ["--card-neon"]: haloColor,
    ["--tiger-glow"]: haloColor,
    animation: haloAnim,
  } as CSSProperties

  return (
    <div className="relative rounded-md" style={outerStyle}>
      <div
        className={cn(
          "tigers-card-frame tigers-parchment-grain relative flex min-h-[420px] w-full flex-col items-center gap-2 overflow-hidden rounded-md px-6 py-5"
        )}
      >
        {/* Big crimson kanji watermark behind everything. */}
        <KanjiWatermark kanji={accent.kanji} />

        {/* Card-rank glyphs in corners (top-left + bottom-right mirrored). */}
        <RankMarker
          kanji={accent.kanji}
          romaji={accent.kanjiRomaji}
          position="top-left"
        />
        <RankMarker
          kanji={accent.kanji}
          romaji={accent.kanjiRomaji}
          position="bottom-right"
        />

        {/* Decorative chevron band at the top under the corner markers. */}
        <div className="mt-1 w-[68%]">
          <SawtoothBand />
        </div>

        {/* Animated character sits above the watermark kanji. */}
        <div className="z-10 mt-1">
          <TigerCharacter
            tigerKey={tigerKey}
            mode={mode}
            status={mode === "verdict" ? verdict?.status : undefined}
            stagger={stagger}
          />
        </div>

        <TigerNamePlate name={config.name} tagline={config.tagline} />

        {/* Loading-state dots beneath the tagline. */}
        {mode === "loading" ? <LoadingDots index={index} /> : null}

        {/* Verdict-only: stamp slam + typewriter quote + basis + thinking. */}
        {mode === "verdict" && verdict ? (
          <>
            <Stamp status={verdict.status} stagger={stagger} />
            <div className="z-10 min-h-[3.5rem] w-full">
              <p
                className="text-center font-retro-mono text-base leading-snug sm:text-lg"
                style={{
                  color: "#fde2c0",
                  textShadow: "0 0 8px rgba(255, 184, 0, 0.35)",
                }}
              >
                <Typewriter
                  text={`"${verdict.one_liner}"`}
                  delayMs={stagger + 1100}
                  speedMs={36}
                />
              </p>
            </div>

            {critique ? <TigerThinking text={critique} /> : null}
          </>
        ) : null}

        {/* Decorative chevron band at the bottom above the corner markers. */}
        <div className="mb-1 w-[68%]">
          <SawtoothBand />
        </div>

        {/* White flash overlay when a verdict lands. */}
        {mode === "verdict" ? <CardFlash stagger={stagger} /> : null}
      </div>

      {/* Outer neon halo — sits behind the card via box-shadow on this wrapper. */}
      <div
        aria-hidden
        className="tigers-neon-halo pointer-events-none absolute inset-0 -z-10 rounded-md"
      />
    </div>
  )
}
