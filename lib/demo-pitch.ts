// Canned demo pitch for the landing-page "Try a demo" button. The text
// fills the textarea so the user can either submit it as-is or edit
// first; the audio plays in parallel using macOS's "Rishi" Indian
// English voice (generated offline via `say -v Rishi`).
//
// The pitch is intentionally absurd-but-specific: real product mechanics,
// a price, a monetization story, all delivered with founder-style
// optimism. Gives the Tigers plenty to chew on while making the audience
// laugh.

export const DEMO_PITCH = {
  text: "Greetings, esteemed judges. I humbly present FridgeWave. It scans your refrigerator, cross-references your Spotify, and recommends meals matching your current mood. Sad Bollywood ballads? Reheated dal with a side of regret. I humbly seek five hundred thousand dollars for five percent equity. Thank you very much.",
  audioSrc: "/demo-pitch.m4a",
  // Rough duration in seconds. Used only for an optional progress hint;
  // not relied upon for correctness — the <audio/> ended event drives
  // the real lifecycle.
  approxSeconds: 18,
} as const

export type DemoPitch = typeof DEMO_PITCH
