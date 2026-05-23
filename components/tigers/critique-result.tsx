"use client"

import { useState } from "react"

import type { Critique } from "@/lib/schemas/critique"
import { critiqueToMarkdown } from "@/lib/critique-to-markdown"
import { useTigersStore } from "@/lib/stores/tigers-store"

import { ActionBandHero } from "./action-band-hero"
import { AssumptionsSection } from "./assumptions-section"
import { ResultHeader } from "./critique-result-extras"
import {
  DimensionCard,
  HnThreadList,
  KV,
  ScoreBadge,
  Section,
} from "./critique-result-parts"
import { IterationSection } from "./iteration-section"
import { KillModeSection } from "./kill-mode-section"
import { ShipItSection } from "./ship-it-section"
import { Stage } from "./stage"
import { VerdictBoard } from "./verdict-board"
import { WebSourcesSection } from "./web-sources-section"

type Props = { critique: Critique; pitch: string }

// The full result one-pager, framed as a six-stage decision pipeline so
// the founder has a clear narrative through it rather than a flat list
// of blocks: 01 Verdict → 02 Diagnosis → 03 Risks → 04 Decision → 05
// Artifacts → 06 Iterate.
export function CritiqueResult({ critique, pitch }: Props) {
  const reset = useTigersStore((s) => s.reset)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(critiqueToMarkdown(critique, pitch))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can fail in insecure contexts; silently no-op.
    }
  }

  return (
    <article className="flex w-full flex-col gap-2">
      <ResultHeader copied={copied} onCopy={handleCopy} onReset={reset} />

      <Stage
        number={1}
        title="Verdict"
        subtitle="How the panel called it"
        accent="red"
      >
        <ActionBandHero score={critique.verdict_score} />
        <VerdictBoard critique={critique} />
        <Section title="The pitch">
          <p className="text-zinc-100">{critique.rephrased_idea}</p>
        </Section>
        <Section title="Score summary">
          <div className="flex items-center gap-4">
            <ScoreBadge score={critique.verdict_score} />
            <p className="text-zinc-100">{critique.verdict_summary}</p>
          </div>
        </Section>
      </Stage>

      <Stage
        number={2}
        title="Diagnosis"
        subtitle="Demand · Acquisition · Competitive — what the market is telling us"
        accent="amber"
      >
        <Section title="Signals">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <DimensionCard
              dimensionKey="demand"
              data={critique.signals.demand}
            />
            <DimensionCard
              dimensionKey="acquisition"
              data={critique.signals.acquisition}
            />
            <DimensionCard
              dimensionKey="competitive"
              data={critique.signals.competitive}
            />
          </div>
        </Section>
        {critique.hn_threads.length > 0 ? (
          <Section title="🟠 What HN actually said">
            <HnThreadList threads={critique.hn_threads} />
          </Section>
        ) : null}
        <WebSourcesSection sources={critique.web_sources} />
      </Stage>

      <Stage
        number={3}
        title="Risks"
        subtitle="What's most likely to kill it — and what to test first"
        accent="scarlet"
        anchorId="assumptions"
      >
        <Section title="⚠️ Weakest link">
          <p className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-amber-100">
            {critique.weakest_link}
          </p>
        </Section>
        <AssumptionsSection assumptions={critique.riskiest_assumptions} />
      </Stage>

      <Stage
        number={4}
        title="Decision"
        subtitle="The single test for the next 7 days — or the case to walk away"
        accent="yellow"
        anchorId="kill-mode"
      >
        <Section title="🚀 Next step (7 days)">
          <dl className="grid gap-2 text-sm">
            <KV k="Hypothesis" v={critique.next_step_7_days.hypothesis} />
            <KV k="Test method" v={critique.next_step_7_days.test_method} />
            <KV
              k="Success metric"
              v={critique.next_step_7_days.success_metric}
            />
          </dl>
        </Section>
        <KillModeSection
          killMode={critique.kill_mode}
          score={critique.verdict_score}
        />
      </Stage>

      <Stage
        number={5}
        title="Artifacts"
        subtitle="Launch pack — landing, ads, interview, outreach, distribution, mitigation"
        accent="pink"
        anchorId="ship-it"
      >
        <ShipItSection critique={critique} pitch={pitch} />
      </Stage>

      <Stage
        number={6}
        title="Iterate"
        subtitle="Tweak the idea and see how the score moves"
        accent="emerald"
      >
        <IterationSection originalPitch={pitch} originalCritique={critique} />
      </Stage>
    </article>
  )
}
