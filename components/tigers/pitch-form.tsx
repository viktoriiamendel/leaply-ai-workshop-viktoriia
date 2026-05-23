"use client"

import { useState } from "react"
import {
  RiArrowRightLine,
  RiLoader4Line,
  RiMicLine,
  RiStopFill,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"
import { useTigersStore } from "@/lib/stores/tigers-store"
import { blobToBase64, requestCritique } from "@/lib/tigers-client"

import { DemoPitchButton } from "./demo-pitch-button"

export function PitchForm() {
  const [pitch, setPitch] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const start = useTigersStore((s) => s.start)
  const succeed = useTigersStore((s) => s.succeed)
  const fail = useTigersStore((s) => s.fail)
  const recorder = useVoiceRecorder()

  const recording = recorder.state === "recording"
  const trimmed = pitch.trim()
  const canSubmit = trimmed.length >= 10 && !submitting && !recording

  async function handleSubmitText() {
    if (!canSubmit) return
    setSubmitting(true)
    start()
    try {
      const critique = await requestCritique({ pitch: trimmed })
      succeed(critique, trimmed)
    } catch (err) {
      fail(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleRecord() {
    if (recording) {
      const result = await recorder.stop()
      if (!result) return
      setSubmitting(true)
      start()
      try {
        const base64 = await blobToBase64(result.blob)
        const critique = await requestCritique({
          pitch: trimmed || undefined,
          audio: { mimeType: result.mimeType, base64 },
        })
        succeed(critique, trimmed || "[voice pitch]")
      } catch (err) {
        fail(err instanceof Error ? err.message : "Something went wrong.")
      } finally {
        setSubmitting(false)
      }
    } else {
      await recorder.start()
    }
  }

  const micDisabled =
    submitting ||
    recorder.state === "unsupported" ||
    recorder.state === "denied"

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void handleSubmitText()
      }}
      className="flex w-full flex-col gap-4"
    >
      <DemoPitchButton
        onFillText={setPitch}
        disabled={submitting || recording}
      />

      <Textarea
        value={pitch}
        onChange={(e) => setPitch(e.target.value)}
        placeholder="PITCH YOUR IDEA..."
        rows={6}
        maxLength={4000}
        disabled={submitting || recording}
        className="min-h-40 resize-none rounded border border-red-500/60 bg-zinc-950/80 font-retro-mono text-base text-zinc-100 placeholder:text-zinc-600 focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-500/50"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleToggleRecord()}
          disabled={micDisabled}
          className={
            "border-zinc-700 bg-zinc-900/70 font-display tracking-widest text-zinc-200 uppercase hover:bg-zinc-800 hover:text-zinc-50" +
            (recording
              ? " border-red-500/60 text-red-300 hover:text-red-200"
              : "")
          }
        >
          {recording ? (
            <>
              <RiStopFill className="size-4" /> Stop &amp; send
            </>
          ) : (
            <>
              <RiMicLine className="size-4" /> Record voice
            </>
          )}
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="bg-gradient-to-r from-red-600 via-pink-500 to-pink-600 font-display tracking-widest text-zinc-50 uppercase shadow-[0_0_28px_-4px_rgba(239,68,68,0.85)] hover:from-red-500 hover:via-pink-400 hover:to-pink-500 disabled:bg-zinc-800 disabled:from-zinc-800 disabled:via-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
        >
          {submitting ? (
            <>
              <RiLoader4Line className="size-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              Send to the Tigers <RiArrowRightLine className="size-4" />
            </>
          )}
        </Button>
      </div>
      {recorder.error ? (
        <p className="text-sm text-red-400">{recorder.error}</p>
      ) : null}
      {recorder.state === "unsupported" ? (
        <p className="text-sm text-zinc-500">
          Voice recording isn&apos;t supported in this browser — use text
          instead.
        </p>
      ) : null}
    </form>
  )
}
