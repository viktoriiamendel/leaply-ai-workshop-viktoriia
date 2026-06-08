"use client"

import { RiCheckLine } from "@remixicon/react"

import { COMPLIANCE_RULES } from "@/lib/skill/rulebook"
import type { ComplianceFinding } from "@/lib/schemas/compliance"

const SEV: Record<ComplianceFinding["severity"], string> = {
  high: "text-rose-300 border-rose-400/30",
  medium: "text-amber-300 border-amber-400/30",
  low: "text-sky-300 border-sky-400/30",
}

type Segment =
  | { type: "text"; value: string }
  | { type: "change"; finding: ComplianceFinding }

// Lay the findings back onto the original creative so changes show IN CONTEXT.
function buildSegments(original: string, findings: ComplianceFinding[]) {
  const located: { start: number; end: number; finding: ComplianceFinding }[] =
    []
  const orphans: ComplianceFinding[] = []

  for (const f of findings) {
    const idx = f.before ? original.indexOf(f.before) : -1
    if (idx >= 0)
      located.push({ start: idx, end: idx + f.before.length, finding: f })
    else orphans.push(f)
  }

  located.sort((a, b) => a.start - b.start)

  const segments: Segment[] = []
  let cursor = 0
  for (const m of located) {
    if (m.start < cursor) continue // skip overlaps
    if (m.start > cursor)
      segments.push({ type: "text", value: original.slice(cursor, m.start) })
    segments.push({ type: "change", finding: m.finding })
    cursor = m.end
  }
  if (cursor < original.length)
    segments.push({ type: "text", value: original.slice(cursor) })

  return { segments, orphans }
}

const ruleName = (id: number) =>
  COMPLIANCE_RULES.find((r) => r.id === id)?.name ?? `Rule ${id}`

export function Changelog({
  original,
  findings,
}: {
  original: string
  findings: ComplianceFinding[]
}) {
  const { segments, orphans } = buildSegments(original, findings)
  const flaggedIds = new Set(findings.map((f) => f.ruleId))
  const clean = COMPLIANCE_RULES.filter((r) => !flaggedIds.has(r.id))

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-[family-name:var(--font-editorial)] text-xl text-stone-100">
          Changelog
        </h2>
        <span className="font-mono text-xs text-stone-500">
          {findings.length} changes · {COMPLIANCE_RULES.length} rules checked
        </span>
      </div>

      {/* The original creative with changes tracked in place */}
      <p className="text-[15px] leading-[1.9] whitespace-pre-wrap text-stone-300">
        {segments.map((s, i) =>
          s.type === "text" ? (
            <span key={i}>{s.value}</span>
          ) : (
            <Change key={i} finding={s.finding} />
          )
        )}
      </p>

      {orphans.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-2 font-mono text-[11px] tracking-wider text-stone-500 uppercase">
            Other adjustments
          </p>
          <ul className="space-y-2 text-sm">
            {orphans.map((f, i) => (
              <li key={i} className="border-l-2 border-white/10 pl-3">
                <span
                  className={`mr-2 rounded border px-1 font-mono text-[10px] ${SEV[f.severity]}`}
                >
                  R{f.ruleId}
                </span>
                <span className="text-stone-400">{f.issue}</span>
                {f.after && (
                  <span className="text-emerald-300"> → {f.after}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {clean.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-2 font-mono text-[11px] tracking-wider text-stone-500 uppercase">
            Clean — no issues
          </p>
          <div className="flex flex-wrap gap-1.5">
            {clean.map((r) => (
              <span
                key={r.id}
                title={r.blurb}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 text-[11px] text-emerald-300/90"
              >
                <RiCheckLine className="size-3" />
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// One in-context change: struck original → green replacement, with a rule tag.
function Change({ finding }: { finding: ComplianceFinding }) {
  return (
    <span className="mx-0.5 inline rounded bg-white/[0.04] px-1 align-baseline">
      {finding.before && (
        <span className="text-rose-300/60 line-through decoration-rose-400/40">
          {finding.before}
        </span>
      )}
      {finding.after && (
        <span className="text-emerald-300"> {finding.after}</span>
      )}
      <sup
        title={`${ruleName(finding.ruleId)} — ${finding.issue}`}
        className={`ml-0.5 cursor-help rounded border px-1 font-mono text-[9px] ${SEV[finding.severity]}`}
      >
        R{finding.ruleId}
      </sup>
    </span>
  )
}
