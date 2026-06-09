import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

import { env } from "@/lib/env"
import { extractJsonObject } from "@/lib/extract-json"
import { classifyGeminiError } from "@/lib/gemini-error"
import {
  ChatMessageSchema,
  ComplianceLessonResponseSchema,
} from "@/lib/schemas/compliance"
import { COMPLIANCE_LESSON_PROMPT } from "@/lib/compliance-prompt"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const MODEL = "gemini-2.5-flash"

const BodySchema = z.object({
  creo: z.string().trim().min(1).max(20000),
  compliantText: z.string().trim().min(1).max(20000),
  messages: z.array(ChatMessageSchema).min(1).max(40),
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
      err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request"
    return NextResponse.json(
      { error: message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const transcript = body.messages
    .map((m) => `${m.role === "user" ? "USER" : "EDITOR"}: ${m.content}`)
    .join("\n")

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

  let rawText: string
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `ORIGINAL CREATIVE:\n${body.creo}\n\nFINAL COMPLIANT VERSION:\n${body.compliantText}\n\nREFINEMENT CONVERSATION:\n${transcript}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: COMPLIANCE_LESSON_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    })
    rawText = response.text ?? ""
  } catch (err) {
    const classified = classifyGeminiError(err)
    console.error(
      `Gemini lesson failed [${classified.code}]:`,
      err instanceof Error ? err.message : err
    )
    return NextResponse.json(
      { error: classified.userMessage, code: classified.code },
      { status: classified.httpStatus }
    )
  }

  const json = extractJsonObject(rawText)
  const parsed = json
    ? ComplianceLessonResponseSchema.safeParse(json)
    : { success: false as const }
  if (!parsed.success) {
    console.error("Lesson failed validation. Raw:", rawText.slice(0, 400))
    return NextResponse.json(
      { error: "Could not distil a lesson. Try again." },
      { status: 502 }
    )
  }

  return NextResponse.json({ result: parsed.data }, { status: 200 })
}
