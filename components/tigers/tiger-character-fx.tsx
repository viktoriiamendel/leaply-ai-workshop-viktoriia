"use client"

import type { CSSProperties } from "react"

import type { TigerVerdictStatus } from "@/lib/schemas/critique"

// Visual effects layered on top of (and behind) the tiger character.
// Each piece is purely decorative — no interactivity, no semantic
// meaning. Extracted from tiger-character.tsx to stay within the 200-line
// cap (CLAUDE.md Rule 2).

export function PersonaHalo({ color }: { color: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full"
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        filter: "blur(6px)",
        opacity: 0.55,
      }}
    />
  )
}

export function StatusHalo({
  status,
  stagger,
}: {
  status: TigerVerdictStatus
  stagger: number
}) {
  const color =
    status === "in"
      ? "rgba(16, 185, 129, 0.85)"
      : status === "cautious"
        ? "rgba(245, 158, 11, 0.75)"
        : "rgba(239, 68, 68, 0.65)"
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full"
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
        filter: "blur(10px)",
        opacity: 0,
        animation: `haloAppear 700ms ease-out ${stagger + 300}ms both`,
      }}
    />
  )
}

export function ReactionOverlay({
  status,
  stagger,
}: {
  status: TigerVerdictStatus
  stagger: number
}) {
  if (status === "cautious") {
    return (
      <span
        aria-hidden
        className="absolute -top-3 left-[68%] text-3xl select-none"
        style={{
          animation: `verdictBounceIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) ${stagger + 400}ms 1 both, questionFloat 2.6s ease-in-out ${stagger + 1100}ms infinite`,
          opacity: 0,
        }}
      >
        💭
      </span>
    )
  }
  if (status === "out") {
    return (
      <span
        aria-hidden
        className="absolute top-[30%] left-[55%] text-4xl select-none"
        style={{
          animation: `verdictBounceIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${stagger + 500}ms 1 both`,
          opacity: 0,
          textShadow: "0 0 14px rgba(239,68,68,0.8)",
        }}
      >
        💢
      </span>
    )
  }
  return null
}

export function SparkBurst({ stagger }: { stagger: number }) {
  // Six sparks pop out from the center in a radial pattern.
  const sparks: Array<{ symbol: string; x: number; y: number; delay: number }> =
    [
      { symbol: "✨", x: -60, y: -54, delay: 0 },
      { symbol: "🔥", x: 62, y: -42, delay: 80 },
      { symbol: "💥", x: -54, y: 56, delay: 160 },
      { symbol: "✨", x: 70, y: 40, delay: 220 },
      { symbol: "💫", x: 0, y: -76, delay: 300 },
      { symbol: "🔥", x: 0, y: 64, delay: 360 },
    ]
  return (
    <>
      {sparks.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute text-2xl select-none"
          style={
            {
              top: "50%",
              left: "50%",
              ["--spark-x" as string]: `${s.x}px`,
              ["--spark-y" as string]: `${s.y}px`,
              animation: `sparkPop 1100ms ease-out ${stagger + 500 + s.delay}ms 1 both`,
              opacity: 0,
            } as CSSProperties
          }
        >
          {s.symbol}
        </span>
      ))}
    </>
  )
}
