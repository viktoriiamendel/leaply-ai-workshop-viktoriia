"use client"

import { useState } from "react"
import {
  RiCheckLine,
  RiFileCopyLine,
  RiAlertLine,
  RiInformationLine,
} from "@remixicon/react"

import type { ComplianceResult } from "@/lib/schemas/compliance"

export type Variant = "minimal" | "polished"

export function ComplianceResultView({
  result,
  variant,
  onVariant,
}: {
  result: ComplianceResult
  variant: Variant
  onVariant: (v: Variant) => void
}) {
  const high = result.findings.filter((f) => f.severity === "high").length
  const med = result.findings.filter((f) => f.severity === "medium").length
  const low = result.findings.filter((f) => f.severity === "low").length

  const text =
    variant === "minimal" ? result.compliantMinimal : result.compliantPolished

  return (
    <div className="space-y-5">
      {/* Assessment banner */}
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 shadow-xl shadow-black/30">
        <p className="mb-2 font-mono text-[11px] tracking-[0.2em] text-amber-400/90 uppercase">
          👮 Officer&apos;s assessment
        </p>
        <p className="text-[15px] leading-relaxed text-stone-200">
          {result.assessment}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px]">
          <Stat
            n={result.findings.length}
            label="changes"
            tone="text-stone-300"
          />
          {high > 0 && <Stat n={high} label="🚨 high" tone="text-rose-300" />}
          {med > 0 && <Stat n={med} label="medium" tone="text-amber-300" />}
          {low > 0 && <Stat n={low} label="low" tone="text-sky-300" />}
          {result.findings.length === 0 && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-emerald-300">
              🎉 All clear, officer
            </span>
          )}
        </div>
      </div>

      {/* Two compliant versions to choose from */}
      <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-5 shadow-xl shadow-black/30">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
            <Tab
              active={variant === "minimal"}
              onClick={() => onVariant("minimal")}
            >
              Minimal
            </Tab>
            <Tab
              active={variant === "polished"}
              onClick={() => onVariant("polished")}
            >
              Polished
            </Tab>
          </div>
          <CopyButton text={text} />
        </div>

        <p className="mb-3 text-xs text-stone-500">
          {variant === "minimal"
            ? "Close to your original — only the compliance fixes."
            : "Bold, native, written by a pro copywriter — still fully compliant."}
        </p>

        <p className="font-[family-name:var(--font-editorial)] text-[17px] leading-relaxed whitespace-pre-wrap text-stone-100">
          {text}
        </p>

        {variant === "polished" && result.polishNote && (
          <p className="mt-4 border-t border-white/10 pt-3 text-sm text-emerald-200/80">
            <span className="font-medium">Stronger here:</span>{" "}
            {result.polishNote}
          </p>
        )}
      </section>

      {result.disclaimers.length > 0 && (
        <Panel
          icon={<RiInformationLine className="size-4 text-sky-300" />}
          title="Recommended disclaimers"
        >
          <ul className="space-y-1.5 text-sm text-stone-300">
            {result.disclaimers.map((d, i) => (
              <li key={i} className="leading-relaxed">
                “{d}”
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {result.flags.length > 0 && (
        <Panel
          icon={<RiAlertLine className="size-4 text-amber-300" />}
          title="For the editor (not text)"
        >
          <ul className="list-disc space-y-1 pl-5 text-sm text-stone-400">
            {result.flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm transition ${
        active
          ? "bg-amber-400 text-black"
          : "text-stone-300 hover:text-stone-100"
      }`}
    >
      {children}
    </button>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-stone-200 transition hover:bg-white/10"
    >
      {copied ? (
        <>
          <RiCheckLine className="size-3.5" /> Copied
        </>
      ) : (
        <>
          <RiFileCopyLine className="size-3.5" /> Copy
        </>
      )}
    </button>
  )
}

function Stat({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <span
      className={`rounded-full border border-white/10 bg-black/30 px-2.5 py-1 ${tone}`}
    >
      {n} {label}
    </span>
  )
}

function Panel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-medium tracking-wide text-stone-200">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}
