// The compliance ruleset, derived from the compliance-editor skill.
// Shared by BOTH the model prompt (so findings are keyed to a ruleId) and the
// UI (so the user sees every rule that was checked — proof the full skill
// context is applied). Keep ids stable; edit text freely.

export type ComplianceRule = {
  id: number
  name: string
  blurb: string
}

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 1,
    name: "Medical claims",
    blurb:
      "No disease names or diagnostic absolutes; soften physiology with may/can. Not a medical treatment.",
  },
  {
    id: 2,
    name: "Mechanism = general wellness",
    blurb:
      "Keep fascia/lymph as general education — never the named cause of the viewer's symptoms.",
  },
  {
    id: 3,
    name: "No discrediting doctors / treatment replacement",
    blurb:
      "Remove 'doctors couldn't help', professional referrals to us, or 'built by medical experts'.",
  },
  {
    id: 4,
    name: "Mental health / parenting",
    blurb:
      "No behavioral-disorder symptoms or self-diagnosis checklists; use support language.",
  },
  {
    id: 5,
    name: "No overpromising",
    blurb:
      "No guaranteed results or fixed result-timeframes ('week one…'); abstract feelings only.",
  },
  {
    id: 6,
    name: "No fake expert",
    blurb: "Don't claim the product was built/endorsed by experts unless true.",
  },
  {
    id: 7,
    name: "Fake endorsement / AI / personal story",
    blurb:
      "AI personas, actors and first-person stories need disclaimers, not real-testimony framing.",
  },
  {
    id: 8,
    name: "No fake urgency",
    blurb:
      "No artificial scarcity/countdowns; a genuine cohort-start line is fine.",
  },
  {
    id: 9,
    name: "No sensationalism / attacking alternatives",
    blurb:
      "No fear-mongering; don't discredit stretching, Pilates, massage or cosmetic procedures.",
  },
  {
    id: 10,
    name: "Personalization & printable",
    blurb:
      "'personalized' → 'personal'; 'printable' → 'get your personal plan'.",
  },
  {
    id: 11,
    name: "User count",
    blurb: "No unverified user numbers; 'X took the quiz' is fine.",
  },
  {
    id: 12,
    name: "Science claims / substantiation",
    blurb:
      "No 'science-based / clinically' without a source; flag for the substantiation file.",
  },
  {
    id: 13,
    name: "Depersonalize education",
    blurb:
      "Remove 'you/your' from mechanism explanations; keep it in feelings & CTAs.",
  },
  {
    id: 14,
    name: "Diagnostic CTA",
    blurb:
      "A quiz/test CTA must never claim to diagnose ('find out where you're blocked').",
  },
]

// Compact list injected into the model prompt.
export const RULES_FOR_PROMPT = COMPLIANCE_RULES.map(
  (r) => `${r.id}. ${r.name} — ${r.blurb}`
).join("\n")
