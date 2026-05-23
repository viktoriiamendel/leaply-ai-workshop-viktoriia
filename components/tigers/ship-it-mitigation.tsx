"use client"

import {
  RiAlertLine,
  RiSkullLine,
  RiTimerLine,
  RiWallet3Line,
} from "@remixicon/react"

import type { Mitigation } from "@/lib/schemas/ship-it"

import { CopyButton, PaneCard } from "./ship-it-utils"

// Mitigation tab for the Ship It Pack. Surfaces the fail-cheap plan:
// time-box, budget cap, kill criteria, pre-mortem. Lives in its own
// file to keep ship-it-tabs.tsx under the 200-line cap (Rule 2).

export function MitigationTab({ mitigation }: { mitigation: Mitigation }) {
  const md = [
    "## Fail-cheap mitigation",
    "",
    `**Time-box:** ${mitigation.time_box_days} days`,
    `**Budget cap:** $${mitigation.budget_cap_usd}`,
    "",
    "**Kill criteria:**",
    ...mitigation.kill_criteria.map((k) => `- ${k}`),
    "",
    "**Pre-mortem:**",
    ...mitigation.pre_mortem.map((p) => `- ${p}`),
  ].join("\n")
  return (
    <PaneCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="font-display text-lg tracking-widest text-orange-200 uppercase">
          Fail-cheap mitigation plan
        </div>
        <CopyButton text={md} label="Mitigation plan copied" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat
          icon={<RiTimerLine className="size-5 text-amber-300" aria-hidden />}
          label="Time-box"
          value={`${mitigation.time_box_days} days`}
          accent="amber"
        />
        <Stat
          icon={
            <RiWallet3Line className="size-5 text-emerald-300" aria-hidden />
          }
          label="Budget cap"
          value={`$${mitigation.budget_cap_usd.toLocaleString()}`}
          accent="emerald"
        />
      </div>
      <SubSection
        icon={<RiSkullLine className="size-4 text-red-300" aria-hidden />}
        title="Kill criteria — pull the plug if any of these hit"
        items={mitigation.kill_criteria}
        tone="red"
      />
      <SubSection
        icon={<RiAlertLine className="size-4 text-amber-300" aria-hidden />}
        title="Pre-mortem — likely failure modes"
        items={mitigation.pre_mortem}
        tone="amber"
      />
    </PaneCard>
  )
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: "amber" | "emerald"
}) {
  const cls =
    accent === "amber"
      ? "border-amber-500/40 bg-amber-500/10"
      : "border-emerald-500/40 bg-emerald-500/10"
  return (
    <div className={`flex items-center gap-3 rounded-md border p-3 ${cls}`}>
      {icon}
      <div>
        <div className="font-retro-mono text-[10px] tracking-widest text-zinc-400 uppercase">
          {label}
        </div>
        <div className="font-display text-lg text-zinc-50">{value}</div>
      </div>
    </div>
  )
}

function SubSection({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  tone: "red" | "amber"
}) {
  const itemCls =
    tone === "red"
      ? "border-red-500/30 bg-red-500/5 text-red-100"
      : "border-amber-500/30 bg-amber-500/5 text-amber-100"
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2 font-retro-mono text-xs tracking-widest text-zinc-400 uppercase">
        {icon}
        <span>{title}</span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={i} className={`rounded-md border p-2 text-sm ${itemCls}`}>
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}
