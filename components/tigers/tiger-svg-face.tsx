"use client"

import type { TigerVerdictStatus } from "@/lib/schemas/critique"

import { TigerEyes } from "./tiger-svg-eyes"
import type { Persona } from "./tiger-personas"
import { NeonStroke } from "./tiger-svg-parts"

// Face overlay for <TigerSvg/>: 3rd-eye flame on the forehead (with
// persona kanji inside), eyes, nose, mouth, persona-tinted whiskers.

type Props = {
  persona: Persona
  status?: TigerVerdictStatus
  blurId: string
}

export function TigerFace({ persona, status, blurId }: Props) {
  return (
    <g>
      <ForeheadFlame persona={persona} />
      <TigerEyes persona={persona} status={status} />
      <NoseMouth persona={persona} status={status} />
      <Whiskers persona={persona} blurId={blurId} />
    </g>
  )
}

// Mystic third-eye flame growing up from the forehead. Inner glyph is
// the persona's kanji (金 / 客 / 技). Burning-tear shape.
function ForeheadFlame({ persona }: { persona: Persona }) {
  return (
    <g>
      {/* Outer flame body */}
      <path
        d="M 100 14 Q 84 32 88 52 Q 96 64 100 68 Q 104 64 112 52 Q 116 32 100 14 Z"
        fill={persona.flameColor}
        stroke={persona.outline}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner bright core */}
      <path
        d="M 100 22 Q 92 36 94 50 Q 100 58 106 50 Q 108 36 100 22 Z"
        fill={persona.flameCore}
        opacity="0.85"
      />
      {/* Kanji */}
      <text
        x="100"
        y="50"
        textAnchor="middle"
        fontSize="13"
        fontFamily="serif"
        fontWeight="900"
        fill={persona.outline}
      >
        {persona.foreheadKanji}
      </text>
    </g>
  )
}

// Painted nose + persona/status-driven mouth.
function NoseMouth({
  persona,
  status,
}: {
  persona: Persona
  status?: TigerVerdictStatus
}) {
  // Baseline mouth per emotion (the persona's RESTING face).
  let mouth = mouthByEmotion(persona.emotion)
  let filled = false

  if (status === "in") {
    mouth = "M 78 156 Q 100 184 122 156 Q 100 172 78 156 Z"
    filled = true
  } else if (status === "out") {
    mouth = "M 82 174 Q 100 156 118 174"
    filled = false
  }

  return (
    <g>
      {/* Pink nose */}
      <path
        d="M 90 138 Q 100 134 110 138 L 106 150 Q 100 155 94 150 Z"
        fill={persona.nose}
        stroke={persona.outline}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse
        cx="104"
        cy="138"
        rx="2"
        ry="1.2"
        fill={persona.flameCore}
        opacity="0.7"
      />
      <path
        d={mouth}
        fill={filled ? persona.stripe : "none"}
        stroke={persona.outline}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Greedy persona gets a gold fang on IN smile */}
      {filled && persona.emotion === "greedy" ? (
        <path
          d="M 96 158 L 99 170 L 102 158 Z"
          fill={persona.flameColor}
          stroke={persona.outline}
          strokeWidth="1"
        />
      ) : null}
    </g>
  )
}

function mouthByEmotion(emotion: Persona["emotion"]): string {
  if (emotion === "greedy") {
    // Smirk — left side curls up like a calculating grin
    return "M 84 162 Q 96 158 102 162 Q 110 172 120 162"
  }
  if (emotion === "skeptical") {
    // Pursed thin line, slight downturn
    return "M 84 164 Q 100 168 116 162"
  }
  // laser — tight horizontal clench with slight side ticks
  return "M 80 162 L 120 162"
}

const WHISKERS = [
  "M 60 140 L 36 134",
  "M 60 146 L 32 148",
  "M 60 152 L 36 158",
  "M 140 140 L 164 134",
  "M 140 146 L 168 148",
  "M 140 152 L 164 158",
]

function Whiskers({ persona, blurId }: { persona: Persona; blurId: string }) {
  return (
    <g opacity="0.85">
      {WHISKERS.map((d) => (
        <NeonStroke
          key={d}
          d={d}
          glow={persona.whiskerColor}
          core={persona.flameCore}
          glowWidth={2.4}
          coreWidth={0.7}
          blurId={blurId}
        />
      ))}
    </g>
  )
}
