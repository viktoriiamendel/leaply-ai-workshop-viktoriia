"use client"

import type { TigerVerdictStatus } from "@/lib/schemas/critique"

import type { Persona } from "./tiger-personas"

// Eyes + brow per persona emotion. Three variants:
//
//   greedy     — narrow gold sclera, vertical slit pupil, $ glint,
//                stern slanted brows. The Investor's stare.
//   skeptical  — big round eyes, pupils SHIFTED sideways (side-eye),
//                asymmetric brow (one raised, one lowered).
//   laser      — long narrow horizontal eyes with crosshair pupils,
//                low straight focused brows. The Builder's stare.
//
// Verdict status layers on top: OUT closes eyes to angry slits,
// CAUTIOUS enlarges skeptical pupils to the other side, etc.

type Props = { persona: Persona; status?: TigerVerdictStatus }

function EyeMask({ p }: { p: Persona }) {
  // Tight kohl patches around each eye — small, organic, NOT a full
  // "domino mask" (that read as a skull). Each patch hugs the eye with
  // a slight outward smudge toward the cheek.
  return (
    <g fill={p.stripe}>
      <path d="M 50 90 Q 48 112 72 114 Q 90 114 92 96 Q 92 82 72 80 Q 54 82 50 90 Z" />
      <path d="M 150 90 Q 152 112 128 114 Q 110 114 108 96 Q 108 82 128 80 Q 146 82 150 90 Z" />
    </g>
  )
}

function Sclera({ p, rx, ry }: { p: Persona; rx: number; ry: number }) {
  return (
    <g fill={p.eyeSclera} stroke={p.outline} strokeWidth="1.8">
      <ellipse cx="70" cy="100" rx={rx} ry={ry} />
      <ellipse cx="130" cy="100" rx={rx} ry={ry} />
    </g>
  )
}

function Brow({ p, left, right }: { p: Persona; left: string; right: string }) {
  return (
    <g fill="none" stroke={p.outline} strokeWidth="5" strokeLinecap="round">
      <path d={left} />
      <path d={right} />
    </g>
  )
}

export function TigerEyes({ persona: p, status: s }: Props) {
  if (p.emotion === "greedy") return <Greedy p={p} s={s} />
  if (p.emotion === "skeptical") return <Skeptical p={p} s={s} />
  return <Laser p={p} s={s} />
}

function Greedy({ p, s }: { p: Persona; s?: TigerVerdictStatus }) {
  const slit = s === "out"
  return (
    <g>
      <EyeMask p={p} />
      <Sclera p={p} rx={14} ry={11} />
      {slit ? (
        <g stroke={p.outline} strokeWidth="3" strokeLinecap="round">
          <path d="M 58 100 L 82 100" />
          <path d="M 118 100 L 142 100" />
        </g>
      ) : (
        <g>
          <ellipse cx="70" cy="100" rx="3.2" ry="8" fill={p.eyePupil} />
          <ellipse cx="130" cy="100" rx="3.2" ry="8" fill={p.eyePupil} />
          <text
            x="70"
            y="97"
            textAnchor="middle"
            fontSize="7"
            fontWeight="900"
            fontFamily="serif"
            fill={p.eyeGlint}
          >
            $
          </text>
          <text
            x="130"
            y="97"
            textAnchor="middle"
            fontSize="7"
            fontWeight="900"
            fontFamily="serif"
            fill={p.eyeGlint}
          >
            $
          </text>
        </g>
      )}
      <Brow
        p={p}
        left="M 46 84 Q 64 76 86 90"
        right="M 154 84 Q 136 76 114 90"
      />
    </g>
  )
}

function Skeptical({ p, s }: { p: Persona; s?: TigerVerdictStatus }) {
  // Pupil shifts dramatically with status — that's the persona's tell.
  //   idle      → +8  (sus side-eye right)
  //   in        →  0  (centered, wide-eyed approval)
  //   cautious  → -8  (looking AWAY in concern)
  //   out       → +12 (hard glance away in disgust)
  let dx = 8
  if (s === "in") dx = 0
  else if (s === "cautious") dx = -8
  else if (s === "out") dx = 12
  return (
    <g>
      <EyeMask p={p} />
      <Sclera p={p} rx={15} ry={12} />
      <circle cx={70 + dx} cy="100" r="5.5" fill={p.eyePupil} />
      <circle cx={130 + dx} cy="100" r="5.5" fill={p.eyePupil} />
      <circle cx={71 + dx} cy="98" r="1.6" fill={p.eyeGlint} />
      <circle cx={131 + dx} cy="98" r="1.6" fill={p.eyeGlint} />
      <Brow
        p={p}
        left="M 50 82 Q 64 72 86 84"
        right="M 114 92 Q 130 88 150 92"
      />
    </g>
  )
}

function Laser({ p, s }: { p: Persona; s?: TigerVerdictStatus }) {
  const ry = s === "out" ? 3 : 6
  return (
    <g>
      <EyeMask p={p} />
      <Sclera p={p} rx={17} ry={ry} />
      <g stroke={p.eyePupil} strokeWidth="1.4" strokeLinecap="round">
        <line x1="60" y1="100" x2="80" y2="100" />
        <line x1="70" y1="94" x2="70" y2="106" />
        <line x1="120" y1="100" x2="140" y2="100" />
        <line x1="130" y1="94" x2="130" y2="106" />
      </g>
      <circle cx="70" cy="100" r="2.4" fill={p.eyePupil} />
      <circle cx="130" cy="100" r="2.4" fill={p.eyePupil} />
      <Brow p={p} left="M 50 88 L 88 92" right="M 150 88 L 112 92" />
    </g>
  )
}
