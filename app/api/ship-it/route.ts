import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

import { env } from "@/lib/env"
import { extractJsonObject } from "@/lib/extract-json"
import { classifyGeminiError } from "@/lib/gemini-error"
import { CritiqueSchema } from "@/lib/schemas/critique"
import { ShipItPackSchema } from "@/lib/schemas/ship-it"
import { SHIP_IT_SYSTEM_PROMPT } from "@/lib/ship-it-prompt"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "gemini-2.5-flash"

// We accept the full critique and the original pitch so the model has
// everything it needs to derive launch artifacts without re-grounding.
const BodySchema = z.object({
  pitch: z.string().min(1).max(4000),
  critique: CritiqueSchema,
})

export async function POST(req: Request) {
  if (!env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY. Add it to .env.local." },
      { status: 500 }
    )
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message
        : "Invalid request body"
    return NextResponse.json(
      { error: message ?? "Invalid request body" },
      { status: 400 }
    )
  }

  // Compact context block for the model. We don't pass `hn_threads` (not
  // relevant) and we keep verdicts short so the prompt stays focused.
  const context = {
    pitch: body.pitch,
    rephrased_idea: body.critique.rephrased_idea,
    verdict_summary: body.critique.verdict_summary,
    verdict_score: body.critique.verdict_score,
    signals: body.critique.signals,
    riskiest_assumptions: body.critique.riskiest_assumptions,
    weakest_link: body.critique.weakest_link,
    next_step_7_days: body.critique.next_step_7_days,
    tiger_verdicts: body.critique.tiger_verdicts,
  }
  const userMessage = `ORIGINAL PITCH AND TIGERS CRITIQUE:\n${JSON.stringify(context, null, 2)}\n\nProduce the Ship It Pack as instructed.`

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

  let rawText: string
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: SHIP_IT_SYSTEM_PROMPT,
        // No grounding — pure synthesis from the supplied critique. This
        // lets us safely use a JSON mime type for a tighter contract.
        responseMimeType: "application/json",
        responseSchema: shipItResponseSchema(),
        temperature: 0.85,
        maxOutputTokens: 6144,
      },
    })
    rawText = response.text ?? ""
  } catch (err) {
    const classified = classifyGeminiError(err)
    console.error(
      `Ship It Gemini call failed [${classified.code}]:`,
      err instanceof Error ? err.message : err
    )
    return NextResponse.json(
      { error: classified.userMessage, code: classified.code },
      { status: classified.httpStatus }
    )
  }

  const json = extractJsonObject(rawText)
  if (!json) {
    console.error(
      "No JSON object found in Ship It output. Raw text:",
      rawText.slice(0, 500)
    )
    return NextResponse.json(
      { error: "The pack came back unreadable. Try again." },
      { status: 502 }
    )
  }

  const parsed = ShipItPackSchema.safeParse(json)
  if (!parsed.success) {
    console.error("Ship It pack failed zod validation:", parsed.error.issues)
    return NextResponse.json(
      { error: "The pack was incomplete. Try again." },
      { status: 502 }
    )
  }

  return NextResponse.json({ pack: parsed.data }, { status: 200 })
}

// Plain-JSON response schema in the Gemini-API shape. We can't pass our
// zod schema directly; we describe the same shape using primitive types.
function shipItResponseSchema() {
  const STRING = { type: "string" } as const
  const NUMBER = { type: "number" } as const
  return {
    type: "object",
    required: [
      "landing_page",
      "ad_concepts",
      "interview_script",
      "outreach_dm",
      "distribution_post",
      "mitigation",
    ],
    properties: {
      landing_page: {
        type: "object",
        required: [
          "headline",
          "subheadline",
          "sections",
          "cta",
          "pricing_line",
        ],
        properties: {
          headline: STRING,
          subheadline: STRING,
          sections: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "body"],
              properties: { title: STRING, body: STRING },
            },
          },
          cta: STRING,
          pricing_line: STRING,
        },
      },
      ad_concepts: {
        type: "array",
        items: {
          type: "object",
          required: [
            "pain_target",
            "headline",
            "body",
            "cta",
            "visual_direction",
          ],
          properties: {
            pain_target: STRING,
            headline: STRING,
            body: STRING,
            cta: STRING,
            visual_direction: STRING,
          },
        },
      },
      interview_script: {
        type: "object",
        required: ["intro", "questions"],
        properties: {
          intro: STRING,
          questions: { type: "array", items: STRING },
        },
      },
      outreach_dm: {
        type: "object",
        required: ["subject", "body"],
        properties: {
          subject: { type: "string", nullable: true },
          body: STRING,
        },
      },
      distribution_post: {
        type: "object",
        required: ["platform", "title", "body"],
        properties: {
          platform: {
            type: "string",
            enum: ["reddit", "hn", "twitter", "linkedin"],
          },
          title: { type: "string", nullable: true },
          body: STRING,
        },
      },
      mitigation: {
        type: "object",
        required: [
          "time_box_days",
          "budget_cap_usd",
          "kill_criteria",
          "pre_mortem",
        ],
        properties: {
          time_box_days: NUMBER,
          budget_cap_usd: NUMBER,
          kill_criteria: { type: "array", items: STRING },
          pre_mortem: { type: "array", items: STRING },
        },
      },
    },
  }
}
