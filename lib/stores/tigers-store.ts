import { create } from "zustand"

import type { Critique } from "@/lib/schemas/critique"

// Discriminated union for the four phases of the Tigers flow.
// Components select on `phase` and never see invalid combinations.
export type TigersPhase =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "result"; critique: Critique; pitch: string }
  | { phase: "error"; message: string }

type TigersStore = TigersPhase & {
  start: () => void
  succeed: (critique: Critique, pitch: string) => void
  fail: (message: string) => void
  reset: () => void
}

export const useTigersStore = create<TigersStore>((set) => ({
  phase: "idle",
  start: () => set({ phase: "loading" }),
  succeed: (critique, pitch) => set({ phase: "result", critique, pitch }),
  fail: (message) => set({ phase: "error", message }),
  reset: () => set({ phase: "idle" }),
}))
