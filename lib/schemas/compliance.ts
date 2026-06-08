import { z } from "zod"

// One issue the editor found, tied to a rule from COMPLIANCE_RULES.
export const ComplianceFindingSchema = z.object({
  ruleId: z.number().int(), // which rule (see lib/skill/rulebook.ts)
  severity: z.enum(["low", "medium", "high"]),
  issue: z.string(), // what's wrong, in plain English
  before: z.string(), // original snippet ("" if it's an addition)
  after: z.string(), // compliant replacement ("" if it's a pure removal)
})

// The full result returned by /api/compliance.
export const ComplianceResultSchema = z.object({
  assessment: z.string(), // 1–2 sentence overview of what was found (English)
  // Two compliant rewrites, both SAME language as the input creative:
  compliantMinimal: z.string(), // close to the original + only compliance fixes
  compliantPolished: z.string(), // pro-copywriter: bold, native, still compliant
  polishNote: z.string(), // 1–2 sentences: how the polished version improves the copy
  findings: z.array(ComplianceFindingSchema),
  disclaimers: z.array(z.string()), // recommended disclaimer wordings (English)
  flags: z.array(z.string()), // editor/visual/substantiation notes (English)
})

export type ComplianceFinding = z.infer<typeof ComplianceFindingSchema>
export type ComplianceResult = z.infer<typeof ComplianceResultSchema>

// ---- Refinement chat ----

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
})
export type ChatMessage = z.infer<typeof ChatMessageSchema>

// What the chat route returns: a short reply + the updated compliant version.
export const ComplianceChatResponseSchema = z.object({
  reply: z.string(), // 1–3 sentence note on what changed (or why a request can't be done)
  compliantText: z.string(), // the full updated compliant version
})
export type ComplianceChatResponse = z.infer<
  typeof ComplianceChatResponseSchema
>

// ---- Lesson capture (teach the rulebook from a refinement chat) ----

export const ComplianceLessonResponseSchema = z.object({
  markdown: z.string(), // a ready-to-paste lesson in the learned-examples format
})
export type ComplianceLessonResponse = z.infer<
  typeof ComplianceLessonResponseSchema
>
