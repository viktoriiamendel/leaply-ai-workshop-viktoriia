import { z } from "zod"

// Parse and validate environment variables once at startup.
// Add a field here whenever you reference a new process.env.X in code.
// Required vars use .min(1) / .url() etc; optional vars use .optional().
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Server-only secret — used by /api/critique to call Gemini.
  // Never expose to the browser; never prefix with NEXT_PUBLIC_.
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required").optional(),

  // Set to "1" in .env.local to bypass Gemini entirely and serve a
  // saved real response from public/demo-critique.json. Used when the
  // live key is rate-limited / revoked / unavailable — keeps the demo
  // resilient. The fixture is real Gemini output captured earlier.
  DEMO_MODE: z.string().optional(),
})

export const env = EnvSchema.parse(process.env)
export type Env = z.infer<typeof EnvSchema>
