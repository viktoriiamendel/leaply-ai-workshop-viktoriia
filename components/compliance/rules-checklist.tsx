"use client"

import { RiCheckLine } from "@remixicon/react"

import { COMPLIANCE_RULES } from "@/lib/skill/rulebook"
import type { ComplianceFinding } from "@/lib/schemas/compliance"

const SEV: Record<
  ComplianceFinding["severity"],
  { dot: string; text: string; label: string }
> = {
  high: { dot: "bg-rose-400", text: "text-rose-300", label: "High" },
  medium: { dot: "bg-amber-400", text: "text-amber-300", label: "Medium" },
  low: { dot: "bg-sky-400", text: "text-sky-300", label: "Low" },
}

export function RulesChecklist({
  findings,
}: {
  findings: ComplianceFinding[]
}) {
  const byRule = new Map<number, ComplianceFinding[]>()
  for (const f of findings) {
    byRule.set(f.ruleId, [...(byRule.get(f.ruleId) ?? []), f])
  }
  const flagged = COMPLIANCE_RULES.filter((r) => byRule.has(r.id))
  const clean = COMPLIANCE_RULES.filter((r) => !byRule.has(r.id))

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-[family-name:var(--font-editorial)] text-xl text-stone-100">
          Ruleset coverage
        </h2>
        <span className="font-mono text-xs text-stone-500">
          {flagged.length} flagged · {COMPLIANCE_RULES.length} checked
        </span>
      </div>

      <div className="space-y-4">
        {flagged.map((rule) => (
          <div
            key={rule.id}
            className="rounded-xl border border-white/10 bg-black/30 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-amber-400/80">
                R{rule.id}
              </span>
              <span className="text-sm font-medium text-stone-100">
                {rule.name}
              </span>
            </div>
            <div className="space-y-3">
              {(byRule.get(rule.id) ?? []).map((f, i) => (
                <div key={i} className="border-l-2 border-white/10 pl-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`size-1.5 rounded-full ${SEV[f.severity].dot}`}
                    />
                    <span
                      className={`text-[11px] font-medium ${SEV[f.severity].text}`}
                    >
                      {SEV[f.severity].label}
                    </span>
                    <span className="text-xs text-stone-400">{f.issue}</span>
                  </div>
                  {f.before && (
                    <p className="font-mono text-xs text-rose-300/70 line-through decoration-rose-400/40">
                      {f.before}
                    </p>
                  )}
                  {f.after && (
                    <p className="font-mono text-xs text-emerald-300">
                      {f.after}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {clean.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="mb-2 font-mono text-[11px] tracking-wider text-stone-500 uppercase">
            Clean — no issues
          </p>
          <div className="flex flex-wrap gap-2">
            {clean.map((rule) => (
              <span
                key={rule.id}
                title={rule.blurb}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-xs text-emerald-300/90"
              >
                <RiCheckLine className="size-3" />
                {rule.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
