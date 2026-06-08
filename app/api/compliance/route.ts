import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

import { env } from "@/lib/env"
import { extractJsonObject } from "@/lib/extract-json"
import { classifyGeminiError } from "@/lib/gemini-error"
import { ComplianceResultSchema } from "@/lib/schemas/compliance"
import { COMPLIANCE_SYSTEM_PROMPT } from "@/lib/compliance-prompt"

// Gemini SDK needs Node APIs; every creative is unique so don't cache.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "gemini-2.5-flash"

// The creative text to check. Generous max — storytells can be long.
const BodySchema = z.object({
  creo: z
    .string()
    .trim()
    .min(10, "Встав текст крео (мін. 10 символів).")
    .max(20000),
})

export async function POST(req: Request) {
  if (!env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error: "На сервері не задано GEMINI_API_KEY. Додай його у .env.local.",
      },
      { status: 500 }
    )
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (err) {
    const message =
      err instanceof z.ZodError ? err.issues[0]?.message : "Некоректний запит"
    return NextResponse.json(
      { error: message ?? "Некоректний запит" },
      { status: 400 }
    )
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

  let rawText: string
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: body.creo }] }],
      config: {
        systemInstruction: COMPLIANCE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.4,
        maxOutputTokens: 8192,
      },
    })
    rawText = response.text ?? ""
  } catch (err) {
    const classified = classifyGeminiError(err)
    console.error(
      `Gemini call failed [${classified.code}]:`,
      err instanceof Error ? err.message : err
    )
    return NextResponse.json(
      { error: classified.userMessage, code: classified.code },
      { status: classified.httpStatus }
    )
  }

  // Parse + validate. responseMimeType already asks for JSON, but we strip
  // any stray fences and zod-validate as a safety net.
  const json = extractJsonObject(rawText)
  if (!json) {
    console.error("No JSON in model output. Raw:", rawText.slice(0, 500))
    return NextResponse.json(
      { error: "Модель повернула нечитабельну відповідь. Спробуй ще раз." },
      { status: 502 }
    )
  }

  const parsed = ComplianceResultSchema.safeParse(json)
  if (!parsed.success) {
    console.error("Compliance result failed validation:", parsed.error.issues)
    return NextResponse.json(
      { error: "Відповідь моделі була неповною. Спробуй ще раз." },
      { status: 502 }
    )
  }

  return NextResponse.json({ result: parsed.data }, { status: 200 })
}
