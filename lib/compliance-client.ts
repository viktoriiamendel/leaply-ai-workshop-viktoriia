import {
  ComplianceResultSchema,
  ComplianceChatResponseSchema,
  type ComplianceResult,
  type ComplianceChatResponse,
  type ChatMessage,
} from "@/lib/schemas/compliance"

// Calls /api/compliance. Throws an Error with a user-friendly (Ukrainian)
// message on any failure path; the caller surfaces error.message in the UI.
export async function requestComplianceCheck(
  creo: string
): Promise<ComplianceResult> {
  let response: Response
  try {
    response = await fetch("/api/compliance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creo }),
    })
  } catch {
    throw new Error("Помилка мережі. Перевір з'єднання і спробуй ще раз.")
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new Error("Сервер повернув нечитабельну відповідь.")
  }

  if (!response.ok) {
    const message =
      isObject(json) && typeof json.error === "string"
        ? json.error
        : `Запит не вдався (${response.status}).`
    throw new Error(message)
  }

  if (!isObject(json) || !("result" in json)) {
    throw new Error("Сервер повернув несподівану відповідь.")
  }

  const parsed = ComplianceResultSchema.safeParse(json.result)
  if (!parsed.success) {
    throw new Error("Результат був некоректний. Спробуй ще раз.")
  }
  return parsed.data
}

// Refinement chat. Sends the original creative, the current compliant version,
// and the conversation (last message = the new user request); returns the
// updated version + a short reply. Throws Error(message) on failure.
export async function requestComplianceRefine(input: {
  creo: string
  compliantText: string
  messages: ChatMessage[]
}): Promise<ComplianceChatResponse> {
  let response: Response
  try {
    response = await fetch("/api/compliance/chat", {
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

  if (!isObject(json) || !("result" in json)) {
    throw new Error("The server returned an unexpected response.")
  }

  const parsed = ComplianceChatResponseSchema.safeParse(json.result)
  if (!parsed.success) {
    throw new Error("The reply was malformed. Try again.")
  }
  return parsed.data
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}
