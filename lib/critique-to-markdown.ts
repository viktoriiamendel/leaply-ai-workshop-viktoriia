import type {
  Critique,
  Dimension,
  DimensionKey,
  TigerVerdict,
} from "@/lib/schemas/critique"
import { TIGER_BY_DIMENSION } from "@/lib/schemas/critique"

// Serializes a Critique into a markdown document the user can paste into
// Notion / a doc / Slack. Order matches the on-screen one-pager.
export function critiqueToMarkdown(critique: Critique, pitch: string): string {
  const lines: string[] = []
  lines.push("# Tigers verdict")
  lines.push("")
  lines.push(`> ${pitch.trim()}`)
  lines.push("")

  lines.push("## Tiger verdicts")
  appendVerdict(lines, "💰🐯 Money Tiger", critique.tiger_verdicts.money_tiger)
  appendVerdict(lines, "🤔🐯 User Tiger", critique.tiger_verdicts.user_tiger)
  appendVerdict(lines, "⚙️🐯 Tech Tiger", critique.tiger_verdicts.tech_tiger)

  lines.push("## The pitch")
  lines.push(critique.rephrased_idea)
  lines.push("")

  lines.push("## Verdict")
  lines.push(`**Score: ${critique.verdict_score} / 100**`)
  lines.push("")
  lines.push(critique.verdict_summary)
  lines.push("")

  lines.push("## Signals")
  lines.push("")
  appendDimension(lines, "demand", critique.signals.demand)
  appendDimension(lines, "acquisition", critique.signals.acquisition)
  appendDimension(lines, "competitive", critique.signals.competitive)

  if (critique.hn_threads.length > 0) {
    lines.push("## What HN actually said")
    for (const t of critique.hn_threads) {
      lines.push(
        `- [${t.title}](${t.url}) — ${t.points} points, ${t.num_comments} comments`
      )
    }
    lines.push("")
  }

  lines.push("## Riskiest assumptions to test first")
  critique.riskiest_assumptions.forEach((a, i) => {
    lines.push(`### ${i + 1}. ${a.assumption}`)
    lines.push(`**Why risky:** ${a.why_risky}`)
    lines.push(`**Cheap test:** ${a.cheap_test}`)
    lines.push("")
  })

  lines.push("## Weakest link")
  lines.push(critique.weakest_link)
  lines.push("")

  lines.push("## Why this might die (and adjacent ideas)")
  lines.push(`**Why die:** ${critique.kill_mode.why_die}`)
  lines.push("")
  lines.push("**Suggested pivots:**")
  critique.kill_mode.suggested_pivots.forEach((p, i) => {
    lines.push(`${i + 1}. **${p.direction}** — ${p.rationale}`)
  })
  lines.push("")

  lines.push("## Next step (7 days)")
  lines.push(`**Hypothesis:** ${critique.next_step_7_days.hypothesis}`)
  lines.push(`**Test method:** ${critique.next_step_7_days.test_method}`)
  lines.push(`**Success metric:** ${critique.next_step_7_days.success_metric}`)
  lines.push("")

  lines.push("## What each tiger said")
  lines.push(`**Money Tiger.** ${critique.tiger_critiques.money_tiger}`)
  lines.push("")
  lines.push(`**User Tiger.** ${critique.tiger_critiques.user_tiger}`)
  lines.push("")
  lines.push(`**Tech Tiger.** ${critique.tiger_critiques.tech_tiger}`)
  return lines.join("\n")
}

const DIMENSION_LABEL: Record<DimensionKey, string> = {
  demand: "Demand",
  acquisition: "Acquisition",
  competitive: "Competitive",
}

function appendVerdict(lines: string[], label: string, v: TigerVerdict): void {
  const stamp =
    v.status === "in"
      ? "🟢 I'M IN"
      : v.status === "cautious"
        ? "🟡 CAUTIOUS"
        : "🔴 I'M OUT"
  lines.push(`- **${label}** — ${stamp} — "${v.one_liner}"`)
  lines.push("")
}

function appendDimension(
  lines: string[],
  key: DimensionKey,
  d: Dimension
): void {
  const tiger = TIGER_BY_DIMENSION[key]
  lines.push(
    `### ${DIMENSION_LABEL[key]} — ${d.score}/100 (${tiger.emoji} ${tiger.name})`
  )
  lines.push(d.headline)
  lines.push("")
  for (const b of d.bullets) {
    const marker = b.tone === "green" ? "🟢" : b.tone === "red" ? "🔴" : "⚪"
    lines.push(`- ${marker} ${b.text}`)
  }
  lines.push("")
}
