"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// State machine for a one-shot voice recording.
// "idle" → user can start.
// "recording" → user can stop. We collect chunks into `chunks.current`.
// "denied" / "unsupported" — terminal until the user reloads.
export type RecorderState = "idle" | "recording" | "denied" | "unsupported"

type Result = {
  state: RecorderState
  error: string | null
  start: () => Promise<void>
  stop: () => Promise<{ blob: Blob; mimeType: string } | null>
  cancel: () => void
}

// Mime types we ask for, in preference order. Browsers ignore unknown ones.
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
]

function detectInitialState(): RecorderState {
  if (typeof window === "undefined") return "idle"
  if (
    typeof window.MediaRecorder === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return "unsupported"
  }
  return "idle"
}

export function useVoiceRecorder(): Result {
  // Lazy initializer — runs once per mount, never re-evaluates. Safe for SSR
  // because `typeof window` is guarded; the client hydration value matches.
  const [state, setState] = useState<RecorderState>(detectInitialState)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const mimeRef = useRef<string>("audio/webm")

  // Tear down any open stream on unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (state === "unsupported") return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType =
        PREFERRED_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? ""
      mimeRef.current = mimeType || "audio/webm"
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.start()
      recorderRef.current = recorder
      setState("recording")
    } catch (err) {
      console.error("Voice recording start failed:", err)
      setError("Microphone access denied or unavailable.")
      setState("denied")
    }
  }, [state])

  const stop = useCallback<Result["stop"]>(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder || recorder.state !== "recording") {
        resolve(null)
        return
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeRef.current })
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        recorderRef.current = null
        chunksRef.current = []
        setState("idle")
        resolve({ blob, mimeType: mimeRef.current })
      }
      recorder.stop()
    })
  }, [])

  const cancel = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state === "recording") recorder.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
    setState("idle")
  }, [])

  return { state, error, start, stop, cancel }
}
