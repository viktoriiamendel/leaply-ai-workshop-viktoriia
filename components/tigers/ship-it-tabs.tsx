"use client"

import { Badge } from "@/components/ui/badge"
import type {
  AdConcept,
  DistributionPost,
  InterviewScript,
  LandingPage,
  OutreachDm,
} from "@/lib/schemas/ship-it"

import { CopyButton, PaneCard } from "./ship-it-utils"

// Re-export MitigationTab so callers continue to import everything from
// ship-it-tabs without caring about the file split.
export { MitigationTab } from "./ship-it-mitigation"

// All five tab panes for <ShipItPackView/>. Each renders one artifact +
// a Copy button (from ship-it-utils) that drops it on the clipboard as
// markdown and fires a Sonner toast.

export function LandingTab({ landing }: { landing: LandingPage }) {
  const md = [
    `# ${landing.headline}`,
    "",
    landing.subheadline,
    "",
    ...landing.sections.flatMap((s) => [`## ${s.title}`, s.body, ""]),
    `**${landing.cta}**`,
    "",
    landing.pricing_line,
  ].join("\n")
  return (
    <PaneCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl text-zinc-50">
          {landing.headline}
        </h3>
        <CopyButton text={md} label="Landing copy copied" />
      </div>
      <p className="text-base text-zinc-300">{landing.subheadline}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {landing.sections.map((s, i) => (
          <li
            key={i}
            className="rounded border border-zinc-800 bg-zinc-950/40 p-3"
          >
            <div className="font-display text-sm tracking-widest text-orange-200 uppercase">
              {s.title}
            </div>
            <p className="mt-1 text-sm text-zinc-200">{s.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-block rounded bg-gradient-to-r from-red-600 to-pink-500 px-4 py-2 font-display tracking-widest text-zinc-50 uppercase">
          {landing.cta}
        </span>
        <span className="font-retro-mono text-sm text-zinc-400 uppercase">
          {landing.pricing_line}
        </span>
      </div>
    </PaneCard>
  )
}

export function AdsTab({ ads }: { ads: AdConcept[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {ads.map((ad, i) => {
        const md = `## Ad ${i + 1} — ${ad.pain_target}\n\n**${ad.headline}**\n\n${ad.body}\n\n*CTA:* ${ad.cta}\n\n*Visual:* ${ad.visual_direction}`
        return (
          <PaneCard key={i}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <Badge
                variant="outline"
                className="border-red-500/50 bg-red-500/10 text-red-200"
              >
                Ad {i + 1}
              </Badge>
              <CopyButton text={md} label={`Ad ${i + 1} copied`} />
            </div>
            <div className="font-retro-mono text-xs tracking-widest text-zinc-500 uppercase">
              Pain target
            </div>
            <p className="mb-3 text-sm text-zinc-300">{ad.pain_target}</p>
            <p className="font-display text-lg text-zinc-50">{ad.headline}</p>
            <p className="mt-2 text-sm text-zinc-200">{ad.body}</p>
            <div className="mt-3 flex flex-col gap-1">
              <span className="font-retro-mono text-[10px] tracking-widest text-emerald-300 uppercase">
                CTA
              </span>
              <span className="text-sm text-emerald-100">{ad.cta}</span>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <span className="font-retro-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                Visual
              </span>
              <span className="text-sm text-zinc-300">
                {ad.visual_direction}
              </span>
            </div>
          </PaneCard>
        )
      })}
    </div>
  )
}

export function InterviewTab({ script }: { script: InterviewScript }) {
  const md = [
    "## Interview script",
    "",
    script.intro,
    "",
    ...script.questions.map((q, i) => `${i + 1}. ${q}`),
  ].join("\n")
  return (
    <PaneCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="font-display text-lg tracking-widest text-orange-200 uppercase">
          Customer interview script
        </div>
        <CopyButton text={md} label="Interview script copied" />
      </div>
      <p className="text-zinc-200 italic">{script.intro}</p>
      <ol className="mt-4 flex list-decimal flex-col gap-2 pl-6 text-zinc-100 marker:font-display marker:text-red-300">
        {script.questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ol>
    </PaneCard>
  )
}

export function OutreachTab({ dm }: { dm: OutreachDm }) {
  const md = dm.subject ? `Subject: ${dm.subject}\n\n${dm.body}` : dm.body
  return (
    <PaneCard>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="font-display text-lg tracking-widest text-orange-200 uppercase">
          Cold outreach DM
        </div>
        <CopyButton text={md} label="Outreach DM copied" />
      </div>
      {dm.subject ? (
        <div className="mb-3 rounded border border-zinc-800 bg-zinc-950/40 p-2">
          <span className="font-retro-mono text-xs tracking-widest text-zinc-500 uppercase">
            Subject
          </span>
          <div className="text-sm text-zinc-100">{dm.subject}</div>
        </div>
      ) : null}
      <pre className="font-sans text-sm whitespace-pre-wrap text-zinc-100">
        {dm.body}
      </pre>
    </PaneCard>
  )
}

export function DistributionTab({ post }: { post: DistributionPost }) {
  const md = post.title ? `# ${post.title}\n\n${post.body}` : post.body
  const platformLabel = post.platform.toUpperCase()
  return (
    <PaneCard>
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge
          variant="outline"
          className="border-orange-500/50 bg-orange-500/10 font-display tracking-widest text-orange-200 uppercase"
        >
          {platformLabel}
        </Badge>
        <CopyButton text={md} label={`${platformLabel} post copied`} />
      </div>
      {post.title ? (
        <h3 className="mb-3 font-display text-xl text-zinc-50">{post.title}</h3>
      ) : null}
      <pre className="font-sans text-sm whitespace-pre-wrap text-zinc-100">
        {post.body}
      </pre>
    </PaneCard>
  )
}
