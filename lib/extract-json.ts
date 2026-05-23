// Pulls the first top-level JSON object out of a string that may contain
// surrounding prose or ```json``` fences. Returns null if none parses.
//
// Robust against: plain JSON, fenced JSON, fenced with leading prose, and
// JSON with trailing text. Uses a balanced-brace scan as the last resort
// so it tolerates unmatched braces inside string values.
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim()
  // Common case: model returned only JSON.
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed)
    } catch {
      // fall through
    }
  }

  // Strip ```json ... ``` fences if present.
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence?.[1]) {
    try {
      return JSON.parse(fence[1].trim())
    } catch {
      // fall through
    }
  }

  // Last resort: balanced-brace scan from the first `{`.
  const start = trimmed.indexOf("{")
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === "\\") {
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) {
        const candidate = trimmed.slice(start, i + 1)
        try {
          return JSON.parse(candidate)
        } catch {
          return null
        }
      }
    }
  }
  return null
}
