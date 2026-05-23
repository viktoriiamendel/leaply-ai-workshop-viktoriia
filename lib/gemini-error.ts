// Classifies an error thrown by the @google/genai SDK into a stable
// shape we can surface to the user. The SDK doesn't expose typed error
// classes, so we sniff the message + status defensively.
//
// Returned `userMessage` is safe to show in the UI — short, plain, and
// actionable. `httpStatus` is what the route should respond with.

export type GeminiErrorClass =
  | "key_leaked" // Google revoked the key as compromised.
  | "key_invalid" // 401 / 403 not specifically "leaked"
  | "rate_limited" // 429 per-minute or per-day
  | "quota_exhausted" // RESOURCE_EXHAUSTED — usually daily cap.
  | "service_error" // 5xx — Gemini side.
  | "network" // request never reached Gemini.
  | "unknown"

export type ClassifiedGeminiError = {
  klass: GeminiErrorClass
  httpStatus: number
  userMessage: string
  // Short tag we can also surface to the UI for analytics / debug.
  code: string
}

export function classifyGeminiError(err: unknown): ClassifiedGeminiError {
  const text = errorText(err).toLowerCase()
  const status = numericStatus(err)

  // Specific case: Google's leak-detection bot revoked the key. Message
  // includes "reported as leaked".
  if (
    text.includes("reported as leaked") ||
    text.includes("api key was reported")
  ) {
    return {
      klass: "key_leaked",
      httpStatus: 503,
      code: "KEY_LEAKED",
      userMessage:
        "Your Gemini API key was revoked by Google (it was reported as leaked). Generate a fresh key at https://aistudio.google.com/apikey and update .env.local.",
    }
  }

  if (
    status === 401 ||
    text.includes("api key not valid") ||
    text.includes("invalid api key")
  ) {
    return {
      klass: "key_invalid",
      httpStatus: 503,
      code: "KEY_INVALID",
      userMessage:
        "Your Gemini API key is missing or invalid. Check the GEMINI_API_KEY entry in .env.local.",
    }
  }

  if (status === 403) {
    return {
      klass: "key_invalid",
      httpStatus: 503,
      code: "KEY_FORBIDDEN",
      userMessage:
        "Gemini returned 403 (permission denied). Check the GEMINI_API_KEY in .env.local — it may be revoked or restricted.",
    }
  }

  if (
    status === 429 ||
    text.includes("resource_exhausted") ||
    text.includes("rate limit")
  ) {
    const isQuota =
      text.includes("quota") || text.includes("resource_exhausted")
    return {
      klass: isQuota ? "quota_exhausted" : "rate_limited",
      httpStatus: 503,
      code: isQuota ? "QUOTA_EXHAUSTED" : "RATE_LIMITED",
      userMessage: isQuota
        ? "Daily Gemini quota exhausted. Free tier caps at ~1k requests/day; wait until midnight Pacific or switch keys."
        : "Gemini rate-limited this request. Wait ~30 seconds and try again.",
    }
  }

  if (status && status >= 500 && status < 600) {
    return {
      klass: "service_error",
      httpStatus: 502,
      code: `GEMINI_${status}`,
      userMessage:
        "Gemini is having problems on their side. Try again in a minute.",
    }
  }

  if (
    text.includes("fetch failed") ||
    text.includes("network") ||
    text.includes("getaddrinfo") ||
    text.includes("econnrefused") ||
    text.includes("etimedout")
  ) {
    return {
      klass: "network",
      httpStatus: 504,
      code: "NETWORK",
      userMessage: "Couldn't reach Gemini. Check your internet connection.",
    }
  }

  return {
    klass: "unknown",
    httpStatus: 502,
    code: "UNKNOWN",
    userMessage: "The model call failed. Try again in a moment.",
  }
}

// Extract a searchable string from whatever shape the SDK threw. The
// SDK sometimes wraps the API error JSON inside `.message`, sometimes
// nests it in `.response` or `.cause`; we just stringify everything.
function errorText(err: unknown): string {
  if (err == null) return ""
  if (typeof err === "string") return err
  if (err instanceof Error) {
    return [err.message, err.stack, String(err.cause ?? "")].join(" ")
  }
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

// Pull a numeric HTTP status out of the error if we can find one.
function numericStatus(err: unknown): number | null {
  if (err == null) return null
  if (typeof err === "object") {
    const o = err as Record<string, unknown>
    if (typeof o.status === "number") return o.status
    if (typeof o.code === "number") return o.code
    if (typeof o.statusCode === "number") return o.statusCode
  }
  // Fallback: scan the stringified error for a 3-digit status near
  // common keys.
  const text = errorText(err)
  const m =
    text.match(/"code"\s*:\s*(\d{3})/) ?? text.match(/\b(4\d{2}|5\d{2})\b/)
  return m ? Number(m[1]) : null
}
