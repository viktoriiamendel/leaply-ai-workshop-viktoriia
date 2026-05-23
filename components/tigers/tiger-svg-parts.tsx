"use client"

import type { Persona } from "./tiger-personas"

// Shared SVG defs + the NeonStroke helper. Filter IDs are scoped per
// persona since up to three TigerSvg instances render on a single page
// — global SVG ids would clash.

export function svgIds(prefix: string) {
  return {
    bg: `tig-bg-${prefix}`,
    aura: `tig-aura-${prefix}`,
    blur: `tig-blur-${prefix}`,
  }
}

type Ids = ReturnType<typeof svgIds>

export function TigerDefs({ persona, ids }: { persona: Persona; ids: Ids }) {
  return (
    <defs>
      <radialGradient id={ids.bg} cx="50%" cy="42%">
        <stop offset="0%" stopColor={persona.bgInner} />
        <stop offset="100%" stopColor={persona.bgOuter} />
      </radialGradient>
      <filter id={ids.blur} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
      <filter id={ids.aura} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="b" />
        <feFlood
          floodColor={persona.auraColor}
          floodOpacity="0.45"
          result="c"
        />
        <feComposite in="c" in2="b" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

type NeonProps = {
  d: string
  glow: string
  core: string
  glowWidth?: number
  coreWidth?: number
  opacity?: number
  blurId: string
}

export function NeonStroke({
  d,
  glow,
  core,
  glowWidth = 5,
  coreWidth = 1.6,
  opacity = 1,
  blurId,
}: NeonProps) {
  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={glow}
        strokeWidth={glowWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
        filter={`url(#${blurId})`}
      />
      <path
        d={d}
        fill="none"
        stroke={core}
        strokeWidth={coreWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}
