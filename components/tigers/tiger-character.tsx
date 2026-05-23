"use client"

import type { TigerVerdictStatus } from "@/lib/schemas/critique"

import { PersonaHalo } from "./tiger-character-fx"
import { TigerSvg } from "./tiger-svg"

// One of three tiger personae. Each renders the parameterized painterly
// portrait <TigerSvg/> with its persona key — body palette, emotion,
// kanji flame, ring tint and aura all come from the persona config.
export type TigerKey = "money_tiger" | "user_tiger" | "tech_tiger"

const HALO_COLOR: Record<TigerKey, string> = {
  money_tiger: "rgba(255, 184, 0, 0.95)",
  user_tiger: "rgba(255, 96, 168, 0.95)",
  tech_tiger: "rgba(0, 225, 255, 0.95)",
}

type Mode = "idle" | "loading" | "verdict"

type Props = {
  tigerKey: TigerKey
  mode: Mode
  status?: TigerVerdictStatus
  stagger?: number
}

export function TigerCharacter({ tigerKey, mode, status, stagger = 0 }: Props) {
  const bodyAnim = pickBodyAnim(mode, status, stagger)
  const tigerOpacity = mode === "verdict" && status === "out" ? 0.6 : 1

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 200, height: 210 }}
    >
      <PersonaHalo color={HALO_COLOR[tigerKey]} />

      <div
        className="relative flex items-center justify-center"
        style={{
          width: 185,
          height: 200,
          animation: bodyAnim,
          transformOrigin: "center",
          opacity: tigerOpacity,
          transition: "opacity 400ms ease-out",
          willChange: "transform",
        }}
      >
        <TigerSvg
          tigerKey={tigerKey}
          status={mode === "verdict" ? status : undefined}
        />
      </div>
    </div>
  )
}

// Picks the right CSS animation chain for the body based on mode + status.
function pickBodyAnim(
  mode: Mode,
  status: TigerVerdictStatus | undefined,
  stagger: number
): string {
  if (mode === "loading") {
    return `tigerCharPace 1.4s ease-in-out infinite ${stagger}ms`
  }
  if (mode === "verdict") {
    if (status === "in") {
      return `verdictCheer 1.1s ease-out ${stagger + 600}ms 1 both, tigerCharBob 2.2s ease-in-out ${stagger + 1700}ms infinite`
    }
    if (status === "out") {
      return `verdictShake 0.55s ease-in-out ${stagger + 600}ms 1 both`
    }
    if (status === "cautious") {
      return `tigerCharBob 2.4s ease-in-out ${stagger + 600}ms infinite`
    }
  }
  return `tigerCharBob 2.6s ease-in-out infinite ${stagger}ms`
}
