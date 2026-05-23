// Presentational helpers used by <CritiqueResult/>. Extracted to keep
// critique-result.tsx under the 200-line cap (CLAUDE.md Rule 2).

import { RiExternalLinkLine } from "@remixicon/react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  Bullet,
  Dimension,
  DimensionKey,
  HnThread,
} from "@/lib/schemas/critique"
import { TIGER_BY_DIMENSION } from "@/lib/schemas/critique"

export function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/70">
      <CardHeader>
        <CardTitle
          className="font-display text-lg tracking-widest text-orange-200 uppercase"
          style={{ textShadow: "0 0 14px rgba(255,107,0,0.45)" }}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function ScoreBadge({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <div
      className={`shrink-0 rounded-md border px-3 py-2 text-center ${color}`}
    >
      <div className="text-2xl leading-none font-semibold">{score}</div>
      <div className="mt-1 text-[10px] tracking-widest uppercase opacity-70">
        / 100
      </div>
    </div>
  )
}

export function MiniScore({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <span
      className={`shrink-0 rounded border px-2 py-0.5 font-mono text-xs ${color}`}
    >
      {score}
    </span>
  )
}

export function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <dt className="font-retro-mono text-sm tracking-widest text-zinc-500 uppercase">
        {k}
      </dt>
      <dd className="text-zinc-100">{v}</dd>
    </div>
  )
}

export function TigerQuote({
  emoji,
  name,
  quote,
}: {
  emoji: string
  name: string
  quote: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex items-center gap-2 text-xs tracking-wide text-zinc-400 uppercase">
        <span aria-hidden>{emoji}</span>
        <span>{name}</span>
      </div>
      <p className="text-sm text-zinc-200 italic">&ldquo;{quote}&rdquo;</p>
    </div>
  )
}

const DIMENSION_LABEL: Record<DimensionKey, string> = {
  demand: "Demand",
  acquisition: "Acquisition",
  competitive: "Competitive",
}

export function DimensionCard({
  dimensionKey,
  data,
}: {
  dimensionKey: DimensionKey
  data: Dimension
}) {
  const tiger = TIGER_BY_DIMENSION[dimensionKey]
  return (
    <Card className="flex flex-col gap-3 border-zinc-800 bg-zinc-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-display text-sm tracking-widest text-zinc-200 uppercase">
            {DIMENSION_LABEL[dimensionKey]}
          </div>
          <div className="flex items-center gap-2 font-retro-mono text-sm text-zinc-500 uppercase">
            <span aria-hidden>{tiger.emoji}</span>
            <span>{tiger.name}</span>
          </div>
        </div>
        <MiniScore score={data.score} />
      </div>
      <ScoreBar score={data.score} />
      <p className="text-sm text-zinc-100">{data.headline}</p>
      <ul className="flex flex-col gap-2">
        {data.bullets.map((b, i) => (
          <BulletRow key={i} bullet={b} />
        ))}
      </ul>
    </Card>
  )
}

// Mini horizontal progress bar — score 0-100. Color matches MiniScore.
function ScoreBar({ score }: { score: number }) {
  const fillColor =
    score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
      <div
        className={`h-full ${fillColor}`}
        style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
      />
    </div>
  )
}

export function BulletRow({ bullet }: { bullet: Bullet }) {
  const dot =
    bullet.tone === "green"
      ? "bg-emerald-500"
      : bullet.tone === "red"
        ? "bg-red-500"
        : "bg-zinc-500"
  return (
    <li className="flex gap-2.5 text-sm text-zinc-200">
      <span
        className={`mt-2 inline-block size-1.5 shrink-0 rounded-full ${dot}`}
      />
      <span className="flex-1">
        {bullet.text} <SourceBadge source={bullet.source} />
      </span>
    </li>
  )
}

// Tiny inline trust-marker shown after each bullet. "web" = grounded in
// a Google Search result the model actually fetched; "reasoning" = the
// model's synthesis without a cited source. Transparent at a glance so
// the founder can tell which claims they can audit further.
function SourceBadge({ source }: { source: "web" | "reasoning" }) {
  if (source === "web") {
    return (
      <span
        className="ml-1 inline-flex translate-y-[-1px] items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0 align-middle font-retro-mono text-[10px] tracking-widest text-emerald-300 uppercase"
        title="Grounded in a Google Search result"
      >
        ✦ sourced
      </span>
    )
  }
  return (
    <span
      className="ml-1 inline-flex translate-y-[-1px] items-center gap-1 rounded border border-zinc-700 bg-zinc-800/40 px-1.5 py-0 align-middle font-retro-mono text-[10px] tracking-widest text-zinc-400 uppercase"
      title="Inferred from the pitch — not from a fetched source"
    >
      ◇ inferred
    </span>
  )
}

export function HnThreadList({ threads }: { threads: HnThread[] }) {
  if (threads.length === 0) return null
  return (
    <ul className="flex flex-col gap-2">
      {threads.map((t, i) => (
        <li key={i}>
          <a
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-950/40 p-3 hover:border-orange-500/40 hover:bg-zinc-900"
          >
            <span className="flex-1 text-sm text-zinc-100 group-hover:text-orange-200">
              {t.title}
            </span>
            <span className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
              <span>▲ {t.points}</span>
              <span>{t.num_comments} comments</span>
              <RiExternalLinkLine className="size-3.5" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function scoreColor(score: number): string {
  if (score >= 70) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
  }
  if (score >= 40) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-200"
  }
  return "border-red-500/40 bg-red-500/10 text-red-200"
}
