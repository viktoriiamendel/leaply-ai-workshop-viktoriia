import { z } from "zod"

// Launch artifacts derived from an existing critique. Every field is a
// ready-to-paste piece of content — landing copy, ad concepts, customer
// interview script, cold-outreach DM, and the distribution post.

export const LandingPageSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  sections: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .min(2)
    .max(6),
  cta: z.string().min(1),
  pricing_line: z.string().min(1),
})

export const AdConceptSchema = z.object({
  pain_target: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  cta: z.string().min(1),
  visual_direction: z.string().min(1),
})

export const InterviewScriptSchema = z.object({
  intro: z.string().min(1),
  questions: z.array(z.string().min(1)).min(5).max(8),
})

export const OutreachDmSchema = z.object({
  subject: z.string().min(1).nullable(),
  body: z.string().min(1),
})

export const DistributionPostSchema = z.object({
  platform: z.enum(["reddit", "hn", "twitter", "linkedin"]),
  title: z.string().min(1).nullable(),
  body: z.string().min(1),
})

// "If you launch this anyway, here is how to fail cheap." For low-score
// ideas, mitigation is the LIFELINE — it lets the founder run a real
// experiment without sinking 6 months. For high-score ideas, the kill
// criteria are still the right discipline.
export const MitigationSchema = z.object({
  time_box_days: z.number().int().min(1).max(180),
  budget_cap_usd: z.number().int().min(0).max(50000),
  kill_criteria: z.array(z.string().min(1)).min(2).max(5),
  pre_mortem: z.array(z.string().min(1)).min(2).max(5),
})

export const ShipItPackSchema = z.object({
  landing_page: LandingPageSchema,
  ad_concepts: z.array(AdConceptSchema).min(2).max(4),
  interview_script: InterviewScriptSchema,
  outreach_dm: OutreachDmSchema,
  distribution_post: DistributionPostSchema,
  mitigation: MitigationSchema,
})

export type LandingPage = z.infer<typeof LandingPageSchema>
export type AdConcept = z.infer<typeof AdConceptSchema>
export type InterviewScript = z.infer<typeof InterviewScriptSchema>
export type OutreachDm = z.infer<typeof OutreachDmSchema>
export type DistributionPost = z.infer<typeof DistributionPostSchema>
export type Mitigation = z.infer<typeof MitigationSchema>
export type ShipItPack = z.infer<typeof ShipItPackSchema>
