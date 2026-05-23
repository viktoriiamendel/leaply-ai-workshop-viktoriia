"use client"

import { Button } from "@/components/ui/button"
import { useTigersStore } from "@/lib/stores/tigers-store"

import { CritiqueResult } from "./critique-result"
import { LoadingTigers } from "./loading-tigers"
import { PitchForm } from "./pitch-form"
import { TigerPanel, type TigerKey } from "./tiger-panel"

const TIGER_ORDER: TigerKey[] = ["money_tiger", "user_tiger", "tech_tiger"]

// Top-level switch component. Picks one of four UIs based on the phase
// in the zustand store. Each phase is self-contained — no prop drilling.
export function TigersApp() {
  const phase = useTigersStore((s) => s.phase)

  if (phase === "loading") return <LoadingTigers />

  if (phase === "result") {
    return <ResultPhase />
  }

  if (phase === "error") {
    return <ErrorPhase />
  }

  return <Landing />
}

function Landing() {
  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="tigers-title-glow font-display text-6xl tracking-[0.04em] text-red-100 uppercase sm:text-7xl md:text-8xl">
          Tigers
        </h1>
        <p className="font-retro-mono text-base tracking-[0.3em] text-red-300/80 uppercase sm:text-lg">
          Crash-test your idea before the market does
        </p>
      </header>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {TIGER_ORDER.map((key, i) => (
          <TigerPanel key={key} tigerKey={key} mode="idle" index={i} />
        ))}
      </div>

      <div className="w-full max-w-2xl">
        <PitchForm />
      </div>
    </div>
  )
}

function ResultPhase() {
  const critique = useTigersStore((s) =>
    s.phase === "result" ? s.critique : null
  )
  const pitch = useTigersStore((s) => (s.phase === "result" ? s.pitch : ""))
  if (!critique) return null
  return (
    <div className="w-full max-w-4xl">
      <CritiqueResult critique={critique} pitch={pitch} />
    </div>
  )
}

function ErrorPhase() {
  const message = useTigersStore((s) => (s.phase === "error" ? s.message : ""))
  const reset = useTigersStore((s) => s.reset)
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
      <h2 className="font-display text-3xl text-red-300 uppercase">
        The panel walked out
      </h2>
      <p className="font-retro-mono text-base text-zinc-400">{message}</p>
      <Button
        onClick={reset}
        className="bg-orange-500 font-display tracking-widest text-zinc-950 uppercase hover:bg-orange-400"
      >
        Try again
      </Button>
    </div>
  )
}
