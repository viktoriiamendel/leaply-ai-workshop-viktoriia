// Decorative card-frame primitives shared by all three tiger panels.
// Aesthetic: dark crimson shrine surface + glowing crimson/gold neon
// frame, with kanji watermarks and corner kanji rank markers rendered
// as low-opacity glow. No animations live here; all are in globals.css.

import type { TigerKey } from "./tiger-character"

export type CardAccent = {
  // Single kanji used as the giant watermark behind the tiger and as
  // the corner rank glyph.
  kanji: string
  // English-readable hint shown under the rank glyph (small).
  kanjiRomaji: string
  // The CSS `--card-neon` color — drives the outer animated halo.
  neon: string
}

export const CARD_ACCENT: Record<TigerKey, CardAccent> = {
  money_tiger: {
    kanji: "金",
    kanjiRomaji: "KIN",
    neon: "rgba(255, 184, 0, 0.95)",
  },
  user_tiger: {
    kanji: "客",
    kanjiRomaji: "KYAKU",
    neon: "rgba(255, 42, 138, 0.95)",
  },
  tech_tiger: {
    kanji: "技",
    kanjiRomaji: "GI",
    neon: "rgba(0, 225, 255, 0.95)",
  },
}

// Big crimson watermark behind the tiger — low-opacity neon glow on the
// dark shrine surface.
export function KanjiWatermark({ kanji }: { kanji: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
    >
      <span
        className="font-display leading-none"
        style={{
          fontSize: "12rem",
          color: "#ff2a3a",
          opacity: 0.1,
          textShadow:
            "0 0 30px rgba(255, 42, 58, 0.5), 0 0 60px rgba(255, 42, 138, 0.3)",
        }}
      >
        {kanji}
      </span>
    </div>
  )
}

// Corner card-rank: glowing gold kanji + cyan romaji underneath.
// Rotated 180° in the bottom-right corner so it mirrors a playing card.
export function RankMarker({
  kanji,
  romaji,
  position,
}: {
  kanji: string
  romaji: string
  position: "top-left" | "bottom-right"
}) {
  const pos =
    position === "top-left" ? "top-4 left-4" : "bottom-4 right-4 rotate-180"
  return (
    <div
      className={`pointer-events-none absolute z-10 flex flex-col items-center select-none ${pos}`}
      aria-hidden
    >
      <span
        className="font-display text-3xl leading-none"
        style={{
          color: "#ffd76b",
          textShadow:
            "0 0 8px rgba(255, 184, 0, 0.85), 0 0 18px rgba(255, 184, 0, 0.45)",
        }}
      >
        {kanji}
      </span>
      <span
        className="mt-0.5 font-retro-mono text-[10px] tracking-widest"
        style={{
          color: "#7ce8ff",
          opacity: 0.85,
          textShadow: "0 0 6px rgba(0, 225, 255, 0.5)",
        }}
      >
        ✦ {romaji}
      </span>
    </div>
  )
}

// Sawtooth (zigzag) decorative band inside the frame.
export function SawtoothBand() {
  return (
    <div
      aria-hidden
      className="tigers-sawtooth pointer-events-none h-2 w-full"
    />
  )
}
