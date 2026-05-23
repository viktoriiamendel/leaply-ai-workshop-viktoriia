"use client"

import { useRef, useState } from "react"
import { RiPlayFill, RiStopFill } from "@remixicon/react"

import { DEMO_PITCH } from "@/lib/demo-pitch"

// Small button row above the textarea. Clicking it drops the canned
// FridgeWave pitch into the textarea (via `onFillText`) and plays the
// Rishi-voiced m4a audio so the audience hears the pitch as well as
// reads it. The user can still edit the text or stop the playback and
// then send to the tigers normally.
export function DemoPitchButton({
  onFillText,
  disabled,
}: {
  onFillText: (text: string) => void
  disabled?: boolean
}) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function handlePlay() {
    onFillText(DEMO_PITCH.text)
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }

  function handleStop() {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <audio
        ref={audioRef}
        src={DEMO_PITCH.audioSrc}
        preload="auto"
        onEnded={() => setPlaying(false)}
      />
      <span className="font-retro-mono text-xs tracking-widest text-zinc-500 uppercase">
        First time? Pitch a real idea — or hear a demo.
      </span>
      <button
        type="button"
        onClick={playing ? handleStop : handlePlay}
        disabled={disabled}
        className={
          "inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-retro-mono text-xs tracking-widest uppercase transition-colors " +
          (playing
            ? "border-pink-400/70 bg-pink-500/15 text-pink-200 hover:bg-pink-500/25"
            : "border-amber-400/60 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20") +
          " disabled:cursor-not-allowed disabled:opacity-40"
        }
      >
        {playing ? (
          <>
            <RiStopFill className="size-3.5" /> Stop demo
          </>
        ) : (
          <>
            <RiPlayFill className="size-3.5" /> Try the demo pitch
          </>
        )}
      </button>
    </div>
  )
}
