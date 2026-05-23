import { promises as fs } from "node:fs"
import path from "node:path"

import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

import { env } from "@/lib/env"
import { extractJsonObject } from "@/lib/extract-json"
import { classifyGeminiError } from "@/lib/gemini-error"
import {
  CritiqueSchema,
  ModelCritiqueSchema,
  type WebSource,
} from "@/lib/schemas/critique"
import { searchHnThreads } from "@/lib/hn-search"
import { deriveOverallScore } from "@/lib/scoring"
import { TIGERS_SYSTEM_PROMPT } from "@/lib/tigers-prompt"

// Force this route onto the Node runtime — the Gemini SDK uses Node APIs.
export const runtime = "nodejs"

// Don't cache — every pitch is unique.
export const dynamic = "force-dynamic"

const MODEL = "gemini-2.5-flash"

// Body validation. Either `pitch` (text) or `audio` (base64 + mime) is required.
const BodySchema = z
  .object({
    pitch: z.string().trim().min(10).max(6000).optional(),
    audio: z
      .object({
        mimeType: z
          .string()
          .regex(
            /^audio\/(webm|mp4|mpeg|ogg|wav|x-m4a)(;.*)?$/,
            "Unsupported audio mime type"
          ),
        base64: z.string().min(1).max(8_000_000), // ~6MB raw audio
      })
      .optional(),
  })
  .refine((b) => Boolean(b.pitch || b.audio), {
    message: "Provide a pitch (text) or audio.",
  })

export async function POST(req: Request) {
  // DEMO_MODE short-circuit: return the saved real Gemini response from
  // public/demo-critique.json without calling Gemini. Keeps the demo
  // working when the live key is revoked / rate-limited / missing.
  if (env.DEMO_MODE === "1") {
    return serveDemoFixture()
  }

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

  // Build the multimodal user message: text pitch and/or audio inlineData.
  // HN search runs after Gemini, using the model's own suggested keywords.
  const parts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  > = []
  if (body.pitch) parts.push({ text: body.pitch })
  if (body.audio) {
    parts.push({
      inlineData: { mimeType: body.audio.mimeType, data: body.audio.base64 },
    })
    if (!body.pitch) {
      parts.push({
        text: "Transcribe the audio above first, then deliver the panel verdict as instructed.",
      })
    }
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })

  let rawText: string
  let webSources: WebSource[] = []
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: TIGERS_SYSTEM_PROMPT,
        // Google Search grounding. Cannot be combined with
        // responseMimeType: "application/json" — we rely on the system
        // prompt to enforce strict JSON output, then parse + zod-validate.
        tools: [{ googleSearch: {} }],
        temperature: 0.8,
        // Higher token cap so the larger JSON (now including 3 risk
        // assumptions) doesn't get truncated mid-string.
        maxOutputTokens: 8192,
      },
    })
    rawText = response.text ?? ""
    webSources = extractWebSources(response)
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

  // Parse JSON out of the model's text response. Models occasionally wrap
  // output in ```json fences or prepend a stray sentence; strip both.
  const json = extractJsonObject(rawText)
  if (!json) {
    console.error(
      "No JSON object found in model output. Raw text:",
      rawText.slice(0, 500)
    )
    return NextResponse.json(
      { error: "The panel returned an unreadable verdict. Try again." },
      { status: 502 }
    )
  }

  const modelParsed = ModelCritiqueSchema.safeParse(json)
  if (!modelParsed.success) {
    console.error(
      "Model critique failed zod validation:",
      JSON.stringify(modelParsed.error.issues, null, 2)
    )
    return NextResponse.json(
      { error: "The panel's verdict was incomplete. Try again." },
      { status: 502 }
    )
  }

  // Now query HN using the model's own keyword suggestion. Best-effort:
  // if HN is down or returns no matches, the "What HN said" section
  // simply doesn't render.
  const keywords = modelParsed.data.hn_search_keywords ?? ""
  const hnThreads = await searchHnThreads(keywords)

  // Strip the internal-only field and merge HN threads. We also OVERRIDE
  // the model's overall verdict_score with one derived from the three
  // dimension scores — the model often drifts (e.g. score 45 alongside
  // all three tigers IN). The derived score keeps headline + dimensions
  // consistent, so the user never sees a contradictory result.
  const { hn_search_keywords: _omit, ...modelOutput } = modelParsed.data
  void _omit
  const final = CritiqueSchema.safeParse({
    ...modelOutput,
    verdict_score: deriveOverallScore(modelOutput.signals),
    hn_threads: hnThreads,
    web_sources: webSources,
  })
  if (!final.success) {
    console.error("Final critique failed zod validation:", final.error.issues)
    return NextResponse.json(
      { error: "The verdict assembly failed. Try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ critique: final.data }, { status: 200 })
}

// Reads the saved real Gemini response from public/demo-critique.json
// and returns it as the route's response, after re-validating it
// against the current schema. Lets the demo run with no live API key.
async function serveDemoFixture() {
  try {
    const filePath = path.join(process.cwd(), "public", "demo-critique.json")
    const raw = await fs.readFile(filePath, "utf-8")
    const parsed = JSON.parse(raw) as unknown
    const obj = parsed as { critique?: unknown }
    const critique = obj.critique
    const validated = CritiqueSchema.safeParse(critique)
    if (!validated.success) {
      console.error("Demo fixture failed validation:", validated.error.issues)
      return NextResponse.json(
        { error: "Demo fixture is malformed." },
        { status: 500 }
      )
    }
    return NextResponse.json({ critique: validated.data }, { status: 200 })
  } catch (err) {
    console.error("Demo fixture load failed:", err)
    return NextResponse.json(
      { error: "Could not load demo fixture." },
      { status: 500 }
    )
  }
}

// Pulls `{ title, url }` entries out of the Gemini grounding metadata.
// Each grounding chunk has shape `{ web: { uri, title } }` when the
// retrieval succeeded; we dedupe by URL and skip malformed entries.
// The SDK's response type is loose, so we narrow with `unknown` casts.
function extractWebSources(response: unknown): WebSource[] {
  const out: WebSource[] = []
  const seen = new Set<string>()
  const r = response as {
    candidates?: Array<{
      groundingMetadata?: {
        groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>
      }
    }>
  }
  const chunks = r.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
  for (const c of chunks) {
    const url = c.web?.uri
    const title = c.web?.title
    if (!url || !title) continue
    if (seen.has(url)) continue
    seen.add(url)
    try {
      // Reject anything that doesn't parse as a URL.
      new URL(url)
    } catch {
      continue
    }
    out.push({ url, title })
    if (out.length >= 20) break
  }
  return out
}
