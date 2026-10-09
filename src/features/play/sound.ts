/**
 * Synthesized sound cues (WebAudio, no audio files) and light haptics.
 *
 * One AudioContext is shared by every caller and created lazily on the first
 * user gesture after cues are enabled (browsers refuse to start audio
 * otherwise). Everything is a no-op when disabled, unsupported or muted by
 * the OS.
 */
import { useCallback, useEffect, useMemo } from "react";

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let master: GainNode | null = null;

function audio(): Ctx | null {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.18; // tasteful: cues sit well under speech/music
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Create/resume the context. Must run inside a user gesture the first time. */
function prime() {
  const c = audio();
  if (c && c.state === "suspended") void c.resume().catch(() => {});
}

interface Tone {
  freq: number;
  /** Start offset in seconds. */
  at?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  /** Frequency to glide to. */
  to?: number;
}

function play(tones: Tone[]) {
  const c = ctx;
  if (!c || !master || c.state !== "running") return;
  const t0 = c.currentTime + 0.005;
  for (const tone of tones) {
    const osc = c.createOscillator();
    const env = c.createGain();
    const start = t0 + (tone.at ?? 0);
    const end = start + tone.dur;
    osc.type = tone.type ?? "sine";
    osc.frequency.setValueAtTime(tone.freq, start);
    if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, end);
    const peak = tone.gain ?? 1;
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(peak, start + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(env);
    env.connect(master);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

const CUES = {
  /** Short bright tick. */
  correct: () =>
    play([{ freq: 1568, dur: 0.06, type: "triangle", gain: 0.55 }]),
  /** Low soft thud for a skip, timeout or lost life. */
  miss: () => play([{ freq: 180, to: 90, dur: 0.16, type: "sine", gain: 0.9 }]),
  /** Two quiet pips: ten seconds left. */
  warn: () =>
    play([
      { freq: 880, dur: 0.07, type: "square", gain: 0.12 },
      { freq: 880, at: 0.14, dur: 0.07, type: "square", gain: 0.12 },
    ]),
  /** Rising major chord at the end of a run. */
  finish: () =>
    play([
      { freq: 523.25, dur: 0.5, type: "triangle", gain: 0.4 },
      { freq: 659.25, at: 0.06, dur: 0.5, type: "triangle", gain: 0.35 },
      { freq: 783.99, at: 0.12, dur: 0.6, type: "triangle", gain: 0.35 },
      { freq: 1046.5, at: 0.18, dur: 0.7, type: "sine", gain: 0.25 },
    ]),
} as const;

export type SoundCue = keyof typeof CUES;

export interface SoundCues {
  play: (cue: SoundCue) => void;
  /** Short vibration on touch devices (misses only). */
  buzz: () => void;
  enabled: boolean;
}

/**
 * Sound cues gated by the `soundEffects` setting. The AudioContext is created
 * on the first pointer/key gesture after `enabled` becomes true.
 */
export function useSoundCues(enabled: boolean): SoundCues {
  useEffect(() => {
    if (!enabled) return;
    if (ctx && ctx.state === "running") return;
    const onGesture = () => prime();
    window.addEventListener("pointerdown", onGesture, { capture: true });
    window.addEventListener("keydown", onGesture, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture, { capture: true });
      window.removeEventListener("keydown", onGesture, { capture: true });
    };
  }, [enabled]);

  const playCue = useCallback(
    (cue: SoundCue) => {
      if (enabled) CUES[cue]();
    },
    [enabled],
  );
  const buzz = useCallback(() => {
    if (!enabled || typeof navigator === "undefined") return;
    if (!window.matchMedia?.("(pointer: coarse)").matches) return;
    try {
      navigator.vibrate?.(35);
    } catch {
      // Unsupported (iOS Safari) or blocked.
    }
  }, [enabled]);

  return useMemo(
    () => ({ play: playCue, buzz, enabled }),
    [playCue, buzz, enabled],
  );
}
