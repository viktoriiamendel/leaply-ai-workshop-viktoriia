"use client"

import { useState } from "react"
import { RiLoader4Line, RiRefreshLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Critique } from "@/lib/schemas/critique"
import { requestCritique } from "@/lib/tigers-client"

import { VariantCard } from "./variant-card"

type Variant = {
  id: string
  label: string
  variantInput: string
  critique: Critique
}

type Props = {
  originalPitch: string
  originalCritique: Critique
}

// "What if you changed something?" — a focused input that re-runs the
// full analysis with the variant applied. Results stack BELOW the
// original so the founder can compare side by side.
export function IterationSection({ originalPitch, originalCritique }: Props) {
  const [value, setValue] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])

  async function handleSubmit() {
    const trimmed = value.trim()
    if (trimmed.length < 4 || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      // We rebuild the pitch as: original + the variant lens. The model
      // re-runs the full Tigers framework on the variant, grounded by
      // search just like the original call.
      const combined = `ORIGINAL IDEA: ${originalPitch}\n\nVARIANT CHANGE: ${trimmed}\n\nRe-analyze treating the variant as the actual idea. Apply the same framework with fresh search.`
      const critique = await requestCritique({ pitch: combined })
      setVariants((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          label: trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed,
          variantInput: trimmed,
          critique,
        },
      ])
      setValue("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = value.trim().length >= 4 && !submitting

  return (
    <section className="flex flex-col gap-4">
      <h2
        className="text-center font-display text-2xl tracking-widest text-orange-200 uppercase sm:text-3xl"
        style={{ textShadow: "0 0 14px rgba(255,107,0,0.5)" }}
      >
        🔄 What if you changed something?
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
        className="flex flex-col gap-3"
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. enterprise B2B instead of consumers, or one-time pricing, or focused on EU only..."
          rows={3}
          maxLength={500}
          disabled={submitting}
          className="resize-none rounded border border-red-500/40 bg-zinc-950/80 font-retro-mono text-base text-zinc-100 placeholder:text-zinc-600 focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-500/50"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="bg-gradient-to-r from-red-600 via-pink-500 to-pink-600 font-display tracking-widest text-zinc-50 uppercase shadow-[0_0_24px_-6px_rgba(239,68,68,0.85)] hover:from-red-500 hover:via-pink-400 hover:to-pink-500 disabled:from-zinc-800 disabled:via-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
          >
            {submitting ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />{" "}
                Re-analyzing...
              </>
            ) : (
              <>
                <RiRefreshLine className="size-4" /> Re-analyze with this change
              </>
            )}
          </Button>
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </form>

      {variants.map((v) => (
        <VariantCard
          key={v.id}
          label={v.label}
          variantInput={v.variantInput}
          critique={v.critique}
          originalScore={originalCritique.verdict_score}
        />
      ))}
    </section>
  )
}
