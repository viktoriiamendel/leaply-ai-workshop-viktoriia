"use client"

import type { TigerKey } from "./tiger-character"

// Each tiger persona ships its own painted palette + role-matched
// emotion + forehead kanji. Used by <TigerSvg/> to render the right
// painted face with the right mood.

export type EmotionKey = "greedy" | "skeptical" | "laser"

export type Persona = {
  emotion: EmotionKey
  // Painted body palette
  body: string
  bodyShadow: string
  belly: string
  stripe: string
  outline: string
  nose: string
  // Eyes
  eyeSclera: string
  eyePupil: string
  eyeGlint: string
  // Inner ear
  pinkEar: string
  // Third-eye flame
  foreheadKanji: string
  flameColor: string
  flameCore: string
  // Niche + aura
  ringColor: string
  auraColor: string
  bgInner: string
  bgOuter: string
  // Decorative whisker color (small neon accent)
  whiskerColor: string
}

export const PERSONAS: Record<TigerKey, Persona> = {
  money_tiger: {
    emotion: "greedy",
    body: "#e88334",
    bodyShadow: "#b86224",
    belly: "#f5d8a8",
    stripe: "#1f0610",
    outline: "#3a0a14",
    nose: "#c24656",
    eyeSclera: "#ffb800",
    eyePupil: "#1a0508",
    eyeGlint: "#fff5d0",
    pinkEar: "#e07b94",
    foreheadKanji: "金",
    flameColor: "#ffb800",
    flameCore: "#fff5d0",
    ringColor: "#ff2a3a",
    auraColor: "#ff2a8a",
    bgInner: "#2a0510",
    bgOuter: "#06010a",
    whiskerColor: "#ffd76b",
  },
  user_tiger: {
    emotion: "skeptical",
    body: "#e07590",
    bodyShadow: "#a8485c",
    belly: "#f5e0d8",
    stripe: "#2a0810",
    outline: "#4a0e1e",
    nose: "#c24656",
    eyeSclera: "#ffe5f0",
    eyePupil: "#3a0510",
    eyeGlint: "#fff5d0",
    pinkEar: "#f5b8c8",
    foreheadKanji: "客",
    flameColor: "#ff60a8",
    flameCore: "#fff2f6",
    ringColor: "#ff2a8a",
    auraColor: "#ff60a8",
    bgInner: "#280518",
    bgOuter: "#0a0210",
    whiskerColor: "#7ce8ff",
  },
  tech_tiger: {
    emotion: "laser",
    body: "#d18a3a",
    bodyShadow: "#8a5520",
    belly: "#d8d0b8",
    stripe: "#051a1a",
    outline: "#062028",
    nose: "#4a8a9a",
    eyeSclera: "#00e1ff",
    eyePupil: "#06010a",
    eyeGlint: "#eafffc",
    pinkEar: "#9ad8e0",
    foreheadKanji: "技",
    flameColor: "#00e1ff",
    flameCore: "#eafffc",
    ringColor: "#00e1ff",
    auraColor: "#00e1ff",
    bgInner: "#051a20",
    bgOuter: "#01080a",
    whiskerColor: "#ffd76b",
  },
}
