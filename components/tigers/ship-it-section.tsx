"use client"

import { useState } from "react"
import { RiLoader4Line, RiRocketLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import type { Critique } from "@/lib/schemas/critique"
import { ShipItPackSchema, type ShipItPack } from "@/lib/schemas/ship-it"

import { ShipItPackView } from "./ship-it-pack"

type Props = {
  critique: Critique
  pitch: string
}

type Phase =
  | { name: "idle" }
  | { name: "loading" }
  | { name: "ready"; pack: ShipItPack }
  | { name: "error"; message: string }

// Lazy-generates the Ship It Pack on demand. The user sees a big CTA;
// clicking it fires a separate Gemini call to /api/ship-it. The pack
// then renders below in the same section. We keep state local — the
// pack is per-result and shouldn't survive a "New pitch".
export function ShipItSection({ critique, pitch }: Props) {
  const [phase, setPhase] = useState<Phase>({ name: "idle" })

  async function generate() {
    setPhase({ name: "loading" })
    try {
      const res = await fetch("/api/ship-it", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ critique, pitch }),
      })
      const json = await res.json()
      if (!res.ok) {
        const msg =
          typeof json?.error === "string"
            ? json.error
            : `Request failed (${res.status}).`
        throw new Error(msg)
      }
      const parsed = ShipItPackSchema.safeParse(json?.pack)
      if (!parsed.success) throw new Error("The pack response was malformed.")
      setPhase({ name: "ready", pack: parsed.data })
    } catch (err) {
      setPhase({
        name: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      })
    }
  }

  if (phase.name === "ready") {
    return (
      <section className="flex flex-col gap-4">
        <Header />
        <ShipItPackView pack={phase.pack} />
      </section>
    )
  }

  return (
    <section className="flex flex-col items-center gap-4">
      <Header />
      <Button
        type="button"
        onClick={() => void generate()}
        disabled={phase.name === "loading"}
        size="lg"
        className="bg-gradient-to-r from-red-600 via-pink-500 to-orange-400 font-display tracking-widest text-zinc-50 uppercase shadow-[0_0_36px_-6px_rgba(239,68,68,0.85)] hover:from-red-500 hover:via-pink-400 hover:to-orange-300 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:via-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
      >
        {phase.name === "loading" ? (
          <>
            <RiLoader4Line className="size-5 animate-spin" /> Generating...
          </>
        ) : (
          <>
            <RiRocketLine className="size-5" /> Generate Ship It Pack
          </>
        )}
      </Button>
      {phase.name === "error" ? (
        <p className="text-sm text-red-300">{phase.message}</p>
      ) : null}
      {phase.name === "idle" ? (
        <p className="text-center font-retro-mono text-sm tracking-wide text-zinc-500 uppercase">
          Landing copy · 3 ad concepts · interview script · cold DM ·
          distribution post
        </p>
      ) : null}
    </section>
  )
}

function Header() {
  return (
    <h2
      className="text-center font-display text-2xl tracking-widest text-orange-200 uppercase sm:text-3xl"
      style={{ textShadow: "0 0 14px rgba(255,107,0,0.5)" }}
    >
      🚀 Ship It Pack
    </h2>
  )
}
