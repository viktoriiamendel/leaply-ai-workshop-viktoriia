"use client"

import type { Persona } from "./tiger-personas"

// Head-on tiger portrait silhouette: big head filling the frame, ears
// sprouting at the top, organic painterly stripes flowing from the
// forehead and temples down the sides, cream muzzle/jaw area at the
// bottom. The face overlay (eyes, nose, mouth, third-eye flame) sits
// on top of this.

const HEAD_SHAPE =
  "M 30 80 Q 26 48 56 36 Q 78 30 100 30 Q 122 30 144 36 Q 174 48 170 80 Q 174 130 158 168 Q 132 200 100 202 Q 68 200 42 168 Q 26 130 30 80 Z"

const LEFT_EAR = "M 55 35 L 33 8 L 42 16 L 70 38 Z"
const RIGHT_EAR = "M 145 35 L 167 8 L 158 16 L 130 38 Z"
const INNER_EAR_L = "M 52 32 L 42 16 L 62 32 Z"
const INNER_EAR_R = "M 148 32 L 158 16 L 138 32 Z"

// Cream muzzle extends fully to the chin so no orange peeks below as
// awkward dark blotches. Shape tapers from wide upper jowls to a
// rounded chin point.
const MUZZLE =
  "M 50 132 Q 42 168 70 192 Q 100 204 130 192 Q 158 168 150 132 Q 100 122 50 132 Z"

// Painterly organic stripes — chunky brush-stroke shapes flowing from
// the head perimeter inward.
const STRIPES = [
  // Top-of-head — radiating down from crown
  "M 78 32 Q 72 56 64 70 L 56 72 Q 62 50 70 30 Z",
  "M 122 32 Q 128 56 136 70 L 144 72 Q 138 50 130 30 Z",
  "M 92 32 L 86 64 L 80 60 L 86 32 Z",
  "M 108 32 L 114 64 L 120 60 L 114 32 Z",
  // Cheek temple stripes
  "M 34 60 Q 28 88 36 110 L 50 108 Q 44 88 46 58 Z",
  "M 166 60 Q 172 88 164 110 L 150 108 Q 156 88 154 58 Z",
  // Upper-cheek eye-mask outflow stripes
  "M 50 88 Q 44 100 54 116 L 64 112 Q 58 102 60 88 Z",
  "M 150 88 Q 156 100 146 116 L 136 112 Q 142 102 140 88 Z",
  // Lower jaw stripes
  "M 36 134 Q 32 156 44 172 L 56 168 Q 48 152 50 130 Z",
  "M 164 134 Q 168 156 156 172 L 144 168 Q 152 152 150 130 Z",
]

export function TigerHead({ persona }: { persona: Persona }) {
  return (
    <g>
      {/* Outer ears (back) */}
      <path
        d={LEFT_EAR}
        fill={persona.body}
        stroke={persona.outline}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d={RIGHT_EAR}
        fill={persona.body}
        stroke={persona.outline}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d={INNER_EAR_L} fill={persona.pinkEar} />
      <path d={INNER_EAR_R} fill={persona.pinkEar} />

      {/* Head main shape */}
      <path
        d={HEAD_SHAPE}
        fill={persona.body}
        stroke={persona.outline}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Painterly stripes */}
      {STRIPES.map((d) => (
        <path key={d} d={d} fill={persona.stripe} />
      ))}

      {/* Cream muzzle/jaw — covers stripes in the lower face */}
      <path
        d={MUZZLE}
        fill={persona.belly}
        stroke={persona.outline}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </g>
  )
}
