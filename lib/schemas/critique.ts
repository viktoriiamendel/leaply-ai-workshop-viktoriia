import { z } from "zod"

// A single bullet inside a dimension. `tone` drives the dot color in UI
// and the marker in the markdown export. `source` tells the user where
// the claim came from — "web" if the model grounded it in a Google
// Search result, "reasoning" if it's synthesis from the pitch itself.
// Defaults to "reasoning" so older outputs still validate.
export const BulletSchema = z.object({
  text: z.string().min(1),
  tone: z.enum(["green", "red", "neutral"]),
  source: z.enum(["web", "reasoning"]).optional().default("reasoning"),
})

// One of the three independent dimensions of "should I build this?":
//   demand       — does the problem have organic pull?
//   acquisition  — can users be reached economically in this vertical?
//   competitive  — who already plays here and why haven't they killed it?
export const DimensionSchema = z.object({
  score: z.number().min(0).max(100),
  headline: z.string().min(1),
  // Loose: the model occasionally returns 1 or 5 bullets despite the
  // prompt asking for 2-4. We accept 1-6 to avoid 502s on the user.
  bullets: z.array(BulletSchema).min(1).max(6),
})

// Top discussion on Hacker News, used both as Gemini context and as a
// standalone "what HN said" UI block. Validated server-side after the
// Algolia fetch so the model never sees malformed entries.
export const HnThreadSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  points: z.number().int().min(0),
  num_comments: z.number().int().min(0),
})

// One source the model actually fetched via Google Search grounding.
// Extracted from `response.candidates[0].groundingMetadata.groundingChunks`
// on the server and surfaced in the "Sources" footer so the founder can
// audit what the panel was reading.
export const WebSourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
})

export const NextStepSchema = z.object({
  hypothesis: z.string().min(1),
  test_method: z.string().min(1),
  success_metric: z.string().min(1),
})

export const TigerCritiquesSchema = z.object({
  money_tiger: z.string().min(1),
  user_tiger: z.string().min(1),
  tech_tiger: z.string().min(1),
})

// Each tiger votes independently after hearing the pitch. "in" = would
// invest / build / use; "cautious" = wants to see more before committing;
// "out" = pass. Disagreement across tigers is welcome and realistic.
export const TigerVerdictStatusSchema = z.enum(["in", "cautious", "out"])

export const TigerVerdictSchema = z.object({
  status: TigerVerdictStatusSchema,
  // Catchphrase, not a sentence. Max ~12 words. e.g. "I'm not putting a yen
  // in this", "I'd actually pre-order this", "Where is the moat?"
  one_liner: z.string().min(1).max(140),
})

export const TigerVerdictsSchema = z.object({
  money_tiger: TigerVerdictSchema,
  user_tiger: TigerVerdictSchema,
  tech_tiger: TigerVerdictSchema,
})

export const SignalsSchema = z.object({
  demand: DimensionSchema,
  acquisition: DimensionSchema,
  competitive: DimensionSchema,
})

// One falsifiable claim the idea depends on, paired with the cheapest
// way to test it. The whole point is to fail fast, not theorize.
export const RiskiestAssumptionSchema = z.object({
  assumption: z.string().min(1),
  why_risky: z.string().min(1),
  cheap_test: z.string().min(1),
})

// "If the founder walked away from this idea tomorrow, what would they
// build instead?" Used by the UI when the action band is KILL to spell
// out the honest case for not building this, plus 2-4 adjacent
// directions that share the founder's skills/network but route around
// the structural problem.
export const PivotDirectionSchema = z.object({
  direction: z.string().min(1),
  rationale: z.string().min(1),
})

export const KillModeSchema = z.object({
  why_die: z.string().min(1),
  suggested_pivots: z.array(PivotDirectionSchema).min(2).max(4),
})

// Full critique returned by /api/critique. `hn_threads` is added by the
// server (not by Gemini) but lives on the same response object for the UI.
export const CritiqueSchema = z.object({
  rephrased_idea: z.string().min(1),
  verdict_score: z.number().min(0).max(100),
  verdict_summary: z.string().min(1),
  signals: SignalsSchema,
  // Exactly 3 — focuses the founder. More than 3 is a list to ignore;
  // fewer than 3 hides real risk.
  riskiest_assumptions: z.array(RiskiestAssumptionSchema).length(3),
  weakest_link: z.string().min(1),
  next_step_7_days: NextStepSchema,
  // Always produced — UI shows the full "why die" framing only for KILL
  // band, but the suggested_pivots are useful adjacent ideas even for
  // higher-scoring pitches that the founder might want to broaden.
  kill_mode: KillModeSchema,
  tiger_critiques: TigerCritiquesSchema,
  tiger_verdicts: TigerVerdictsSchema,
  hn_threads: z.array(HnThreadSchema).max(5),
  // Server-added: deduped list of URLs the model fetched via Google
  // Search grounding while writing this critique. May be empty.
  web_sources: z.array(WebSourceSchema).max(20).default([]),
})

// The subset the model returns. We strip the server-only `hn_threads`
// + `web_sources` (both server-injected) and add `hn_search_keywords` —
// the model's own suggestion for what an HN reader would type to find
// threads on this topic.
export const ModelCritiqueSchema = CritiqueSchema.omit({
  hn_threads: true,
  web_sources: true,
}).extend({
  // Optional — if the model omits it (some pitches don't map cleanly to
  // HN jargon), the server simply skips the HN call.
  hn_search_keywords: z
    .string()
    .max(200)
    .optional()
    .default("")
    .describe("2-3 words an HN reader would use to find threads on this topic"),
})

export type Bullet = z.infer<typeof BulletSchema>
export type Dimension = z.infer<typeof DimensionSchema>
export type Signals = z.infer<typeof SignalsSchema>
export type RiskiestAssumption = z.infer<typeof RiskiestAssumptionSchema>
export type PivotDirection = z.infer<typeof PivotDirectionSchema>
export type KillMode = z.infer<typeof KillModeSchema>
export type HnThread = z.infer<typeof HnThreadSchema>
export type WebSource = z.infer<typeof WebSourceSchema>
export type NextStep = z.infer<typeof NextStepSchema>
export type TigerCritiques = z.infer<typeof TigerCritiquesSchema>
export type TigerVerdictStatus = z.infer<typeof TigerVerdictStatusSchema>
export type TigerVerdict = z.infer<typeof TigerVerdictSchema>
export type TigerVerdicts = z.infer<typeof TigerVerdictsSchema>
export type Critique = z.infer<typeof CritiqueSchema>
export type ModelCritique = z.infer<typeof ModelCritiqueSchema>

// Dimension key → which tiger leads on it. Used by the UI to label each
// dimension card with the linked tiger persona.
export const TIGER_BY_DIMENSION = {
  demand: { emoji: "🤔", name: "User Tiger" },
  acquisition: { emoji: "🔥", name: "Money Tiger" },
  competitive: { emoji: "⚙️", name: "Tech Tiger" },
} as const

export type DimensionKey = keyof typeof TIGER_BY_DIMENSION
