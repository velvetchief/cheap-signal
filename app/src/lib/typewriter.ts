/**
 * Shared typewriter cadence + digit strike + Web Audio keyclick.
 * Mechanism motif for CosignLetter and SignalLab outcome digits.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Uneven human keystroke delay (ms). */
export function keystrokeDelay(char: string, prev: string | null): number {
  if (char === "\n") return 180 + Math.random() * 140;
  if (prev === "," || prev === ";" || prev === ":") return 110 + Math.random() * 90;
  if (prev === "." || prev === "!" || prev === "?") return 160 + Math.random() * 120;
  if (Math.random() < 0.08) return 90 + Math.random() * 110;
  return 28 + Math.random() * 42;
}

/** Digit-strike cadence (slightly snappier than letter prose). */
export function digitDelay(): number {
  if (Math.random() < 0.12) return 70 + Math.random() * 60;
  return 32 + Math.random() * 38;
}

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

/**
 * Create/resume AudioContext from a user-gesture call path so later
 * keyclicks are audible. Safe to call repeatedly.
 */
export function unlockAudio(): void | Promise<void> {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") return ctx.resume();
}

/** Short synthesized keyclick — no audio files. */
export function playKeyClick(): void {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1800 + Math.random() * 900, t0);
  osc.frequency.exponentialRampToValueAtTime(400, t0 + 0.018);
  gain.gain.setValueAtTime(0.0001, t0);
  // Peak ~0.15 so clicks are actually audible after unlock
  gain.gain.exponentialRampToValueAtTime(0.15, t0 + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.028);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.032);
}

export type TypewriterRunOptions = {
  text: string;
  onChar: (visible: string, index: number) => void;
  onDone?: () => void;
  /** Live getter so toggle mid-type is respected. */
  shouldPlaySound?: () => boolean;
  /** When set true mid-run, dump remaining text once and finish (no restart). */
  signal?: { cancelled: boolean };
};

/**
 * One-pass typewriter. Does not loop. If cancelled mid-way, finishes
 * by dumping remaining text once (clean complete, no restart).
 */
export function runTypewriter(opts: TypewriterRunOptions): () => void {
  const { text, onChar, onDone, shouldPlaySound, signal } = opts;
  let i = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const clear = () => {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const step = () => {
    if (stopped) return;
    if (signal?.cancelled) {
      onChar(text, text.length);
      onDone?.();
      return;
    }
    if (i >= text.length) {
      onDone?.();
      return;
    }
    const char = text[i]!;
    const prev = i > 0 ? text[i - 1]! : null;
    i += 1;
    onChar(text.slice(0, i), i);
    if (shouldPlaySound?.() && char !== "\n" && char !== " ") playKeyClick();
    timer = setTimeout(step, keystrokeDelay(char === "\n" ? "\n" : char, prev));
  };

  timer = setTimeout(step, 40);
  return clear;
}

/**
 * Strike digits one character at a time onto a target string
 * (e.g. "0.42" or "87%"). One pass; cancel jumps to full value.
 */
export function runDigitStrike(opts: {
  target: string;
  onUpdate: (visible: string) => void;
  onDone?: () => void;
  signal?: { cancelled: boolean };
}): () => void {
  const { target, onUpdate, onDone, signal } = opts;
  let i = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const clear = () => {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const step = () => {
    if (stopped) return;
    if (signal?.cancelled) {
      onUpdate(target);
      onDone?.();
      return;
    }
    if (i >= target.length) {
      onDone?.();
      return;
    }
    i += 1;
    onUpdate(target.slice(0, i));
    timer = setTimeout(step, digitDelay());
  };

  onUpdate("");
  timer = setTimeout(step, 20);
  return clear;
}
