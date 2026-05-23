"use client"

import type { TigerVerdictStatus } from "@/lib/schemas/critique"
import { cn } from "@/lib/utils"

import type { TigerKey } from "./tiger-character"
import { PERSONAS } from "./tiger-personas"
import { TigerFace } from "./tiger-svg-face"
import { TigerHead } from "./tiger-svg-head"
import { svgIds, TigerDefs } from "./tiger-svg-parts"

// Parameterized painterly tiger portrait. One component handles all
// three personas (Money / User / Tech) by swapping in palette + emotion
// from <PERSONAS>. Each instance generates its own SVG filter IDs so
// multiple tigers on a page don't share filter state.
//
// Composition (back to front):
//   1. Dark vignette niche
//   2. Persona-tinted neon ring + gold inner ring
//   3. Tiger head (filled silhouette + stripes + muzzle)
//   4. Face overlay (3rd-eye flame, eyes, nose, mouth, whiskers)
// The whole tiger group is wrapped in a soft persona-color aura
// that gives every silhouette edge a glowing halo.

type Props = {
  tigerKey: TigerKey
  status?: TigerVerdictStatus
  className?: string
}

export function TigerSvg({ tigerKey, status, className }: Props) {
  const persona = PERSONAS[tigerKey]
  const ids = svgIds(tigerKey)

  return (
    <svg
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-full w-full select-none", className)}
      role="img"
      aria-label={`${persona.foreheadKanji} tiger portrait`}
    >
      <TigerDefs persona={persona} ids={ids} />

      {/* Dark vignette niche */}
      <circle cx="100" cy="110" r="100" fill={`url(#${ids.bg})`} />
      <circle
        cx="100"
        cy="110"
        r="100"
        fill="none"
        stroke="#0a0204"
        strokeWidth="2"
      />

      {/* Persona-tinted neon ring */}
      <circle
        cx="100"
        cy="110"
        r="95"
        fill="none"
        stroke={persona.ringColor}
        strokeWidth="2.5"
        opacity="0.85"
        filter={`url(#${ids.blur})`}
      />
      <circle
        cx="100"
        cy="110"
        r="95"
        fill="none"
        stroke={persona.flameCore}
        strokeWidth="0.8"
        opacity="0.85"
      />
      <circle
        cx="100"
        cy="110"
        r="89"
        fill="none"
        stroke="#ffc857"
        strokeWidth="0.6"
        opacity="0.5"
      />

      {/* Tiger head + face wrapped in the persona aura halo */}
      <g filter={`url(#${ids.aura})`}>
        <TigerHead persona={persona} />
        <TigerFace persona={persona} status={status} blurId={ids.blur} />
      </g>
    </svg>
  )
}
