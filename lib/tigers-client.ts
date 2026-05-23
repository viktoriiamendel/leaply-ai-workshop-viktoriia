import { CritiqueSchema, type Critique } from "@/lib/schemas/critique"

// Shape the client sends to /api/critique. Either `pitch` or `audio` (or both).
export type CritiqueRequest = {
  pitch?: string
  audio?: { mimeType: string; base64: string }
}

// Calls our server route. Throws an Error with a user-friendly message
// on any failure path (network, bad status, malformed body). The caller
// is expected to surface `error.message` to the UI.
export async function requestCritique(
  input: CritiqueRequest
): Promise<Critique> {
  let response: Response
  try {
    response = await fetch("/api/critique", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error("Network error. Check your connection and try again.")
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new Error("The server returned an unreadable response.")
  }

  if (!response.ok) {
    const message =
      isObject(json) && typeof json.error === "string"
        ? json.error
        : `Request failed (${response.status}).`
    throw new Error(message)
  }

  if (!isObject(json) || !("critique" in json)) {
    throw new Error("The server returned an unexpected response.")
  }

  const parsed = CritiqueSchema.safeParse(json.critique)
  if (!parsed.success) {
    throw new Error("The verdict was malformed. Try again.")
  }
  return parsed.data
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

// Converts a Blob (e.g. from MediaRecorder) into base64 (no data: prefix).
export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ""
  // Chunked to avoid call-stack blowup on large buffers.
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...sub)
  }
  return btoa(binary)
}
