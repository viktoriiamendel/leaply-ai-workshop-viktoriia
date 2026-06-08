// THE single source of truth for the Leaply compliance rulebook.
// Mirrors the compliance-editor skill. Everything else — the UI checklist,
// the editor prompt, and the refine-chat prompt — is derived from THIS file.
// Edit a rule here and it updates the whole app at once.

export type ComplianceRule = {
  id: number
  name: string
  blurb: string // short line shown in the UI ruleset
  fix: string // detailed "how to fix" given to the model
}

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 1,
    name: "Medical claims",
    blurb:
      "No disease names or diagnostic absolutes; soften physiology with may/can. Not a medical treatment.",
    fix: 'No disease names / "chronic" + symptom; diagnostic absolutes → possibility ("IT\'S NOT ABOUT WEIGHT" → "IT MAY NOT BE ABOUT WEIGHT").',
  },
  {
    id: 2,
    name: "Mechanism = general wellness",
    blurb:
      "Keep fascia/lymph as general education — never the named cause of the viewer's symptoms.",
    fix: 'Keep "fascia/lymph/vagus" but as general education; delete symptom→cause chains ("the heavy legs" → "fluid with nowhere to go") and "same upstream cause".',
  },
  {
    id: 3,
    name: "No discrediting doctors / treatment replacement",
    blurb:
      "Remove 'doctors couldn't help', professional referrals to us, or 'built by medical experts'.",
    fix: "Remove the WHOLE narrative where professionals couldn't help / a professional refers to us / a clinical expert built it.",
  },
  {
    id: 4,
    name: "Mental health / parenting",
    blurb:
      "No behavioral-disorder symptoms or self-diagnosis checklists; use support language.",
    fix: "No behavioral-disorder symptoms or self-diagnosis checklists; use support language.",
  },
  {
    id: 5,
    name: "No overpromising",
    blurb:
      "No guaranteed results or fixed result-timeframes ('week one…'); abstract feelings only.",
    fix: 'No guaranteed results or fixed RESULT timeframes ("week one the heaviness lifts"); a PROGRAM duration ("28-day program") is fine. Absolute → modal + feeling; drop result-timeframes; no "snatched / no diets".',
  },
  {
    id: 6,
    name: "No fake expert",
    blurb: "Don't claim the product was built/endorsed by experts unless true.",
    fix: 'No "built by experts" unless true.',
  },
  {
    id: 7,
    name: "Fake endorsement / AI / personal story",
    blurb:
      "AI personas, actors and first-person stories need disclaimers, not real-testimony framing.",
    fix: "Recommend the matching disclaimer (AI-generated / Actor portrayal / Illustrative story).",
  },
  {
    id: 8,
    name: "No fake urgency",
    blurb:
      "No artificial scarcity/countdowns; a genuine cohort-start line is fine.",
    fix: 'No "while this window is open" / countdowns; cohort start is OK.',
  },
  {
    id: 9,
    name: "No sensationalism / attacking alternatives",
    blurb:
      "No fear-mongering; don't discredit stretching, Pilates, massage or cosmetic procedures.",
    fix: "No fear-mongering; don't attack stretching / Pilates / massage / cosmetic procedures.",
  },
  {
    id: 10,
    name: "Personalization & printable",
    blurb:
      "'personalized' → 'personal'; 'printable' → 'get your personal plan'.",
    fix: '"personalized" → "personal"; "printable" → "personal plan".',
  },
  {
    id: 11,
    name: "User count",
    blurb: "No unverified user numbers; 'X took the quiz' is fine.",
    fix: 'No unverified numbers; "X took the quiz" is fine.',
  },
  {
    id: 12,
    name: "Science claims / substantiation",
    blurb:
      "No 'science-based / clinically' without a source; flag for the substantiation file.",
    fix: 'No "science-based / clinically" without a source — flag it.',
  },
  {
    id: 13,
    name: "Depersonalize education",
    blurb:
      "Remove 'you/your' from mechanism explanations; keep it in feelings & CTAs.",
    fix: 'Drop "you/your" in mechanism explanations.',
  },
  {
    id: 14,
    name: "Diagnostic CTA",
    blurb:
      "A quiz/test CTA must never claim to diagnose ('find out where you're blocked').",
    fix: 'A quiz CTA must NEVER claim to diagnose ("find out where you\'re blocked", even "might"); use "Take the quiz and get your personal plan".',
  },
]

export const PHILOSOPHY = `PHILOSOPHY: the viewer diagnoses themselves. Describe a FEELING, ask a QUESTION, explain a GENERAL mechanism — never state a fact about the viewer's body.`

export const DISCLAIMERS_GUIDE = `## Disclaimers (recommend — NEVER inject into compliantText)
- Medical/wellness or parenting → "Leaply is not a substitute for professional medical advice, diagnosis or treatment."
- Any results / promise → "Individual results may vary."
- AI persona → "AI-generated." Real actor → "Actor portrayal." Invented story → "Illustrative story."`

export const FLAGS_GUIDE = `## Flags (things text can't fix): visuals (before/after, body-zoom), IP/music, substantiation needed (rule 12), "expert in a clinical office" framing, disclaimer placement/contrast/duration.`

// The full rule context injected into BOTH prompts (editor + refine chat).
export const RULEBOOK_PROMPT_BLOCK = [
  "## The ruleset (each finding cites one of these ids)",
  COMPLIANCE_RULES.map((r) => `${r.id}. ${r.name} — ${r.blurb}`).join("\n"),
  "",
  "## Rule detail / how to fix",
  COMPLIANCE_RULES.map((r) => `${r.id}. ${r.name}: ${r.fix}`).join("\n"),
  "",
  PHILOSOPHY,
  "",
  DISCLAIMERS_GUIDE,
  "",
  FLAGS_GUIDE,
].join("\n")
