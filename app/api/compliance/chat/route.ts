import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

import { env } from "@/lib/env"
import { extractJsonObject } from "@/lib/extract-json"
import { classifyGeminiError } from "@/lib/gemini-error"
import {
  ChatMessageSchema,
  ComplianceChatResponseSchema,
} from "@/lib/schemas/compliance"
import { COMPLIANCE_CHAT_SYSTEM_PROMPT } from "@/lib/compliance-prompt"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "gemini-2.5-flash"

const BodySchema = z.object({
  creo: z.string().trim().min(1).max(20000), // the original creative
  compliantText: z.string().trim().min(1).max(20000), // current compliant version
  messages: z.array(ChatMessageSchema).min(1).max(40), // chat so far (last = new user msg)
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

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

  // Seed the conversation with the original creative + current version, then
  // replay the chat history (assistant → "model" role for Gemini).
  const contents = [
    {
      role: "user" as const,
      parts: [
        {
          text: `ORIGINAL CREATIVE:\n${body.creo}\n\nCURRENT COMPLIANT VERSION:\n${body.compliantText}\n\nI'll now ask for changes to the compliant version.`,
        },
      ],
    },
    {
      role: "model" as const,
      parts: [
        {
          text: "Understood. I'll apply your changes and keep the version compliant.",
        },
      ],
    },
    ...body.messages.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    })),
  ]

  let rawText: string
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: COMPLIANCE_CHAT_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.4,
        maxOutputTokens: 8192,
      },
    })
    rawText = response.text ?? ""
  } catch (err) {
    const classified = classifyGeminiError(err)
    console.error(
      `Gemini chat failed [${classified.code}]:`,
      err instanceof Error ? err.message : err
    )
    return NextResponse.json(
      { error: classified.userMessage, code: classified.code },
      { status: classified.httpStatus }
    )
  }

  const json = extractJsonObject(rawText)
  const parsed = json
    ? ComplianceChatResponseSchema.safeParse(json)
    : { success: false as const }
  if (!parsed.success) {
    console.error(
      "Chat response failed validation. Raw:",
      rawText.slice(0, 400)
    )
    return NextResponse.json(
      { error: "The editor returned an unreadable reply. Try again." },
      { status: 502 }
    )
  }

  return NextResponse.json({ result: parsed.data }, { status: 200 })
}
