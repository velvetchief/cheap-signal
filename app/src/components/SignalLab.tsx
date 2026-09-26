"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  CREATORS,
  PRESETS,
  ROUNDS,
  SEED,
  WATCHERS,
  logReach,
  narrativeFor,
  paramsFromCost,
  presetNearest,
  runTwelveRounds,
  type MarketMetrics,
  type MarketRun,
  type PresetId,
  type RoundSnapshot,
} from "../lib/marketSim";
import {
  prefersReducedMotion,
  runDigitStrike,
} from "../lib/typewriter";

const PRESET_ORDER: PresetId[] = ["ig2022", "ig2012", "cosign"];

const PLAIN_PARAM: Record<string, string> = {
  COST: "Cost to send",
  "SIGNALS / WATCHER / ROUND": "Signals each watcher sends",
  "AIM AT QUALITY": "Aim at good work",
  BANDWAGON: "Follow the crowd",
  "VOLUME BUYS REACH": "Post more, seen more",
  "ENTRANTS / ROUND": "New performers each round",
};

const PLAIN_OUTCOME: Record<string, { title: string; sub: string }> = {
  sn: { title: "Does reach match quality?", sub: "RANK CORR." },
  worth: { title: "Is a signal proof?", sub: "0 TO 1" },
  ret: { title: "Craft still here", sub: "STILL POSTING" },
};

const JARGON_OUTCOME: Record<string, { title: string; sub: string }> = {
  sn: { title: "SIGNAL TO NOISE", sub: "RANK CORR." },
  worth: { title: "WHAT ONE SIGNAL IS WORTH", sub: "0 TO 1" },
  ret: { title: "CRAFT RETENTION", sub: "STILL POSTING" },
};

function fmt(n: number, digits = 2): string {
  return n.toFixed(digits);
}

function seedHex(seed: number): string {
  return seed.toString(16).toUpperCase().padStart(6, "0");
}

function modeTag(id: PresetId | "custom"): string {
  if (id === "ig2022") return "IG 2022";
  if (id === "ig2012") return "IG 2012";
  if (id === "cosign") return "COSIGN";
  return "CUSTOM";
}

function activeMode(cost: number): PresetId | "custom" {
  const n = presetNearest(cost);
  if (Math.abs(cost - PRESETS[n].cost) < 0.03) return n;
  return "custom";
}

function TypewriterValue({
  value,
  strikeKey,
  className,
  style,
}: {
  value: string;
  strikeKey: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [shown, setShown] = useState(value);
  const clearRef = useRef<(() => void) | null>(null);
  const cancelRef = useRef({ cancelled: false });
  const lastStrike = useRef(strikeKey);
  const lastValue = useRef(value);

  useEffect(() => {
    if (strikeKey !== lastStrike.current) {
      lastStrike.current = strikeKey;
      lastValue.current = value;
      clearRef.current?.();
      cancelRef.current = { cancelled: false };
      if (prefersReducedMotion() || strikeKey === 0) {
        setShown(value);
        return;
      }
      clearRef.current = runDigitStrike({
        target: value,
        signal: cancelRef.current,
        onUpdate: setShown,
      });
      return () => {
        cancelRef.current.cancelled = true;
        clearRef.current?.();
      };
    }
    if (value !== lastValue.current) {
      lastValue.current = value;
      cancelRef.current.cancelled = true;
      clearRef.current?.();
      setShown(value);
    }
  }, [strikeKey, value]);

  useEffect(() => {
    return () => {
      cancelRef.current.cancelled = true;
      clearRef.current?.();
    };
  }, []);

  return (
    <span className={className} style={style}>
      {shown.length ? shown : "\u00a0"}
    </span>
  );
}

const CRAFT_AMBER = "#e08a3c";
const PERFORMER_BLUE = "#4a9ae0";
const LEFT_CORAL = "#e07058";

function Sparkline({
  values,
  color,
  dashed = false,
}: {
  values: number[];
  color: string;
  dashed?: boolean;
}) {
  const w = 160;
  const h = 28;
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.04);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - 3 - ((v - min) / span) * (h - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1]!;
  const lx = w;
  const ly = h - 3 - ((last - min) / span) * (h - 6);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-4 w-full max-w-[180px]"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.25}
        strokeDasharray={dashed ? "3 2.5" : undefined}
        points={pts}
      />
      <circle cx={lx} cy={ly} r={2.2} fill={color} />
    </svg>
  );
}

function ScatterPlot({
  snapshot,
  dormant = false,
}: {
  snapshot: RoundSnapshot;
  dormant?: boolean;
}) {
  const agents = snapshot.agents;
  const round = snapshot.round;
  const W = 640;
  const H = 420;
  const pad = { l: 36, r: 18, t: 44, b: 36 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const reaches = agents.map((a) => logReach(a.reach));
  const yMax = Math.max(2.2, ...reaches, 0.1) * 1.05;
  const yMin = 0;

  const qx = (q: number) => pad.l + q * plotW;
  const ry = (lr: number) =>
    pad.t + plotH - ((lr - yMin) / (yMax - yMin)) * plotH;

  const medQ = snapshot.medianQuality;
  const medR = logReach(Math.max(snapshot.medianReach, 1));

  const mountain = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = pad.l + t * plotW;
      const hump =
        0.35 * Math.exp(-Math.pow((t - 0.28) / 0.18, 2)) +
        0.55 * Math.exp(-Math.pow((t - 0.55) / 0.22, 2)) +
        0.25 * Math.exp(-Math.pow((t - 0.78) / 0.14, 2));
      const y = pad.t + plotH - hump * plotH * 0.55;
      pts.push(`${x},${y}`);
    }
    return `M ${pad.l},${pad.t + plotH} L ${pts.join(" L ")} L ${pad.l + plotW},${pad.t + plotH} Z`;
  }, [pad.l, pad.t, plotH, plotW]);

  const craft = agents.filter((a) => a.kind === "craft");
  const performers = agents.filter((a) => a.kind === "performer");
  const left = agents.filter((a) => a.kind === "left");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      role="img"
      style={{ opacity: dormant ? 0.35 : 1 }}
    >
      <title>
        {dormant
          ? "Dormant quality vs reach scatter"
          : `Quality vs reach scatter, round ${round}`}
      </title>
      <rect x={0} y={0} width={W} height={H} fill="transparent" />
      <path d={mountain} fill="rgb(255 255 255 / 3%)" />

      <line
        x1={qx(medQ)}
        y1={pad.t}
        x2={qx(medQ)}
        y2={pad.t + plotH}
        stroke="rgb(255 255 255 / 18%)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <line
        x1={pad.l}
        y1={ry(medR)}
        x2={pad.l + plotW}
        y2={ry(medR)}
        stroke="rgb(255 255 255 / 18%)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <text
        x={qx(medQ) + 6}
        y={pad.t + 12}
        fill="var(--ink-3)"
        fontSize={9}
        fontFamily="var(--font-mono)"
      >
        MEDIAN QUALITY
      </text>
      <text
        x={pad.l + 6}
        y={ry(medR) - 6}
        fill="var(--ink-3)"
        fontSize={9}
        fontFamily="var(--font-mono)"
      >
        MEDIAN REACH
      </text>

      {performers.map((a) => (
        <circle
          key={`p-${a.id}`}
          cx={qx(a.quality)}
          cy={ry(logReach(a.reach))}
          r={3.2}
          fill={PERFORMER_BLUE}
          opacity={0.9}
        />
      ))}
      {craft.map((a) => {
        const cx = qx(a.quality);
        const cy = ry(logReach(a.reach));
        const named = a.signal === "named";
        return (
          <g key={`c-${a.id}`}>
            {named ? (
              <circle
                cx={cx}
                cy={cy}
                r={5.2}
                fill="none"
                stroke="var(--gold)"
                strokeWidth={1.6}
                opacity={0.95}
              />
            ) : null}
            <circle
              cx={cx}
              cy={cy}
              r={named ? 3.0 : 2.8}
              fill={CRAFT_AMBER}
              opacity={0.95}
            />
          </g>
        );
      })}
      {left.map((a) => (
        <circle
          key={`l-${a.id}`}
          cx={qx(a.quality)}
          cy={ry(logReach(a.reach))}
          r={3.4}
          fill="none"
          stroke={LEFT_CORAL}
          strokeWidth={1.1}
          opacity={0.75}
        />
      ))}
      <text
        x={14}
        y={pad.t + plotH / 2}
        fill="rgb(255 255 255 / 40%)"
        fontSize={9}
        fontFamily="var(--font-plex)"
        letterSpacing="0.08em"
        transform={`rotate(-90 14 ${pad.t + plotH / 2})`}
        textAnchor="middle"
      >
        REACH, LOG
      </text>

      <g
        fontFamily="var(--font-plex)"
        fontSize={9}
        fill="rgb(255 255 255 / 55%)"
      >
        <circle cx={pad.l} cy={18} r={3.2} fill={CRAFT_AMBER} />
        <text x={pad.l + 10} y={21}>
          CRAFT CREATOR
        </text>
        <circle cx={pad.l + 110} cy={18} r={3.2} fill={PERFORMER_BLUE} />
        <text x={pad.l + 120} y={21}>
          PERFORMER
        </text>
        <circle
          cx={pad.l + 200}
          cy={18}
          r={3.2}
          fill="none"
          stroke={LEFT_CORAL}
          strokeWidth={1.1}
        />
        <text x={pad.l + 210} y={21}>
          LEFT
        </text>
        <circle
          cx={pad.l + 280}
          cy={18}
          r={5.0}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={1.4}
        />
        <circle cx={pad.l + 280} cy={18} r={2.6} fill={CRAFT_AMBER} />
        <text x={pad.l + 290} y={21}>
          NAMED SIGNAL
        </text>
      </g>

      <text
        x={W - pad.r}
        y={H - 12}
        textAnchor="end"
        fill="rgb(255 255 255 / 38%)"
        fontSize={9}
        fontFamily="var(--font-plex)"
        letterSpacing="0.06em"
      >
        DROWNED: GOOD WORK, LOW REACH
      </text>
    </svg>
  );
}

function PriceChart({
  curve,
  cost,
  metrics,
}: {
  curve: MarketRun["priceCurve"];
  cost: number;
  metrics: MarketRun["final"]["metrics"];
}) {
  const W = 920;
  const H = 220;
  const pad = { l: 12, r: 12, t: 28, b: 36 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const costs = curve.map((c) => c.cost);
  const minC = Math.min(...costs, 0.05);
  const maxC = Math.max(...costs, 0.92);
  const cx = (c: number) => pad.l + ((c - minC) / (maxC - minC)) * plotW;
  const my = (v: number) => pad.t + plotH - v * plotH;

  const line = (key: "signalToNoise" | "worth" | "retention") =>
    curve
      .map((p, i) => {
        const x = cx(p.cost);
        const y = my(p.metrics[key]);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const marks = PRESET_ORDER.map((id) => ({
    id,
    label: PRESETS[id].chartLabel,
  }));

  return (
    <div className="border-t border-[var(--line)] px-4 pb-4 pt-5 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] font-medium tracking-[0.08em] text-[var(--ink-3)]">
          EVERY PRICE AT ONCE, FINAL ROUND
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] tracking-[0.04em] text-[var(--ink-3)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-px w-4 bg-[var(--ink)]" />
            SIGNAL TO NOISE
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-px w-4"
              style={{ background: "var(--gold)" }}
            />
            WORTH
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-px w-4 border-t border-dashed border-[var(--ink)]"
              style={{ height: 0 }}
            />
            RETENTION
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        <title>Outcomes across every price</title>
        <path
          d={line("signalToNoise")}
          fill="none"
          stroke="#f2f2f0"
          strokeWidth={1.4}
        />
        <path
          d={line("worth")}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={1.4}
        />
        <path
          d={line("retention")}
          fill="none"
          stroke="#f2f2f0"
          strokeWidth={1.4}
          strokeDasharray="5 4"
          opacity={0.85}
        />
        <line
          x1={cx(cost)}
          y1={pad.t}
          x2={cx(cost)}
          y2={pad.t + plotH}
          stroke="var(--gold)"
          strokeWidth={1.5}
        />
        {marks.map((m) => {
          const c = PRESETS[m.id].cost;
          return (
            <text
              key={m.id}
              x={cx(c)}
              y={H - 10}
              textAnchor="middle"
              fill="rgb(255 255 255 / 45%)"
              fontSize={10}
              fontFamily="var(--font-mono)"
              letterSpacing="0.06em"
            >
              {m.label}
            </text>
          );
        })}
      </svg>
      <p className="mt-1 font-mono text-[12px] tabular text-[var(--ink-3)]">
        Now cost {fmt(cost)} · S/N {fmt(metrics.signalToNoise)} · worth{" "}
        {fmt(metrics.worth)} · retention{" "}
        {Math.round(metrics.retention * 100)}%
      </p>
    </div>
  );
}

function deltaCaption(
  key: "signalToNoise" | "worth" | "retention",
  now: MarketMetrics,
  prev: MarketMetrics | null,
): string | null {
  if (!prev) return null;
  const a =
    key === "retention"
      ? Math.round(now.retention * 100)
      : Number(fmt(now[key]));
  const b =
    key === "retention"
      ? Math.round(prev.retention * 100)
      : Number(fmt(prev[key]));
  const d = a - b;
  if (Math.abs(d) < 0.005 && key !== "retention") return "Unchanged from last settle";
  if (d === 0 && key === "retention") return "Unchanged from last settle";
  const arrow = d > 0 ? "↑" : "↓";
  if (key === "retention") {
    return `${arrow} ${Math.abs(d)} pts vs last settle`;
  }
  return `${arrow} ${fmt(Math.abs(d))} vs last settle`;
}

function CostSlider({
  cost,
  onCost,
  onSettle,
  setPreset,
  className = "",
}: {
  cost: number;
  onCost: (c: number) => void;
  onSettle: () => void;
  setPreset: (id: PresetId) => void;
  className?: string;
}) {
  // Local value while dragging so the thumb tracks the pointer without
  // re-rendering the whole lab (scatter / outcomes) on every step.
  const [local, setLocal] = useState(cost);
  const dragging = useRef(false);
  const localRef = useRef(local);
  localRef.current = local;

  useEffect(() => {
    if (!dragging.current) setLocal(cost);
  }, [cost]);

  const commit = () => {
    dragging.current = false;
    const v = localRef.current;
    onCost(v);
    onSettle();
  };

  return (
    <div className={className}>
      <div className="mb-2 flex justify-between text-[10px] font-medium tracking-[0.06em] text-[var(--ink-3)]">
        <span>FREE</span>
        <span>COSTS YOU SOMETHING</span>
      </div>
      <div className="lab-cost-wrap">
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={local}
          onPointerDown={() => {
            dragging.current = true;
          }}
          onChange={(e) => {
            setLocal(Number(e.target.value));
          }}
          onPointerUp={commit}
          onPointerCancel={commit}
          onKeyUp={(e) => {
            if (
              e.key === "ArrowLeft" ||
              e.key === "ArrowRight" ||
              e.key === "Home" ||
              e.key === "End"
            ) {
              commit();
            }
          }}
          className="lab-cost w-full"
          style={{ ["--pct" as string]: `${local * 100}%` }}
          aria-label="What one signal costs the sender"
        />
      </div>
      <div className="relative mt-1 h-5 font-mono text-[9px] tracking-[0.06em] text-[var(--ink-3)]">
        {PRESET_ORDER.map((id) => {
          const p = PRESETS[id];
          return (
            <button
              key={id}
              type="button"
              className="absolute -translate-x-1/2 py-1 hover:text-[var(--ink)]"
              style={{ left: `${p.cost * 100}%` }}
              onClick={() => setPreset(id)}
            >
              {p.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SignalLab() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [cost, setCost] = useState(PRESETS.ig2022.cost);
  const [run, setRun] = useState<MarketRun>(() =>
    runTwelveRounds(PRESETS.ig2022.cost),
  );
  const [displayRound, setDisplayRound] = useState(1);
  const [armed, setArmed] = useState(false);
  const [strikeKey, setStrikeKey] = useState(0);
  const [tickKey, setTickKey] = useState(0);
  const [modeFlash, setModeFlash] = useState(0);
  const [plain, setPlain] = useState(false);
  const [prevMetrics, setPrevMetrics] = useState<MarketMetrics | null>(null);
  const [modelClock, setModelClock] = useState("00:00:00");
  // One CostSlider at a time: desktop left panel on lg+, sticky dock below.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const animRef = useRef<number | null>(null);
  const armedOnce = useRef(false);
  const lastMode = useRef<PresetId | "custom">("ig2022");

  const recompute = useCallback((c: number, animate = false) => {
    const next = runTwelveRounds(c);
    setRun(next);
    if (animate) {
      if (animRef.current) window.clearInterval(animRef.current);
      if (prefersReducedMotion()) {
        setDisplayRound(ROUNDS);
        setStrikeKey((k) => k + 1);
        setTickKey((k) => k + 1);
        return next;
      }
      setDisplayRound(1);
      let r = 1;
      animRef.current = window.setInterval(() => {
        r += 1;
        setDisplayRound(r);
        if (r >= ROUNDS && animRef.current) {
          window.clearInterval(animRef.current);
          animRef.current = null;
          setStrikeKey((k) => k + 1);
          setTickKey((k) => k + 1);
        }
      }, 90);
    } else {
      setDisplayRound(ROUNDS);
    }
    return next;
  }, []);

  const costRef = useRef(cost);
  costRef.current = cost;

  // Arm on scroll into view
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit || armedOnce.current) return;
        armedOnce.current = true;
        setArmed(true);
        if (reduced) {
          setDisplayRound(ROUNDS);
          setStrikeKey((k) => k + 1);
          setTickKey((k) => k + 1);
        } else {
          recompute(costRef.current, true);
        }
      },
      { threshold: 0.28 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [recompute]);

  // Model clock costume — advances with displayRound only (not wall telemetry)
  useEffect(() => {
    const totalSec = Math.max(0, (displayRound - 1) * 5);
    const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    setModelClock(`${hh}:${mm}:${ss}`);
  }, [displayRound]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) window.clearInterval(animRef.current);
    };
  }, []);

  const params = useMemo(() => paramsFromCost(cost), [cost]);
  const nearest = presetNearest(cost);
  const mode = activeMode(cost);
  const snapshot =
    run?.rounds[Math.min(displayRound, ROUNDS) - 1] ?? run?.final ?? null;
  const sparkSeries = useMemo(() => {
    if (!run) return { sn: [], worth: [], ret: [] };
    return {
      sn: run.rounds.map((r) => r.metrics.signalToNoise),
      worth: run.rounds.map((r) => r.metrics.worth),
      ret: run.rounds.map((r) => r.metrics.retention),
    };
  }, [run]);

  // Mode flash when preset chapter swaps
  useEffect(() => {
    if (mode !== lastMode.current) {
      lastMode.current = mode;
      setModeFlash((n) => n + 1);
    }
  }, [mode]);

  // Slider commits cost only on release. costRef stays authoritative for settle.
  const onCost = (c: number) => {
    costRef.current = c;
    setCost(c);
  };

  const lastSettled = useRef<MarketMetrics | null>(null);

  const onSettle = useCallback(() => {
    const c = costRef.current;
    if (!armed) {
      setRun(runTwelveRounds(c));
      return;
    }
    const next = runTwelveRounds(c);
    setRun(next);
    setDisplayRound(ROUNDS);
    const now = next.final.metrics;
    setPrevMetrics(lastSettled.current);
    lastSettled.current = now;
    setStrikeKey((k) => k + 1);
    setTickKey((k) => k + 1);
  }, [armed]);

  const setPreset = (id: PresetId) => {
    const c = PRESETS[id].cost;
    costRef.current = c;
    setCost(c);
    const next = recompute(c, false);
    if (!armed) return;
    setPrevMetrics(lastSettled.current);
    lastSettled.current = next.final.metrics;
    setStrikeKey((k) => k + 1);
    setTickKey((k) => k + 1);
  };

  const replay = () => {
    if (!armed) {
      armedOnce.current = true;
      setArmed(true);
    }
    setPrevMetrics(lastSettled.current);
    const next = recompute(cost, true);
    // One run — reuse final.metrics (no second runTwelveRounds).
    lastSettled.current = next.final.metrics;
  };

  if (!run || !snapshot) {
    return (
      <div className="border border-[var(--line)] p-8 text-[13px] text-[var(--ink-3)]">
        Loading market model…
      </div>
    );
  }

  const m = snapshot.metrics;
  const outcomeLabels = plain ? PLAIN_OUTCOME : JARGON_OUTCOME;
  const paramRows = (
    [
      ["COST", fmt(params.cost)],
      ["SIGNALS / WATCHER / ROUND", String(params.signalsPerWatcher)],
      ["AIM AT QUALITY", fmt(params.aimAtQuality, 1)],
      ["BANDWAGON", fmt(params.bandwagon, 1)],
      ["VOLUME BUYS REACH", fmt(params.volumeBuysReach, 1)],
      ["ENTRANTS / ROUND", String(params.entrantsPerRound)],
    ] as const
  ).map(([k, v]) => [plain ? PLAIN_PARAM[k] ?? k : k, v] as const);

  return (
    <div ref={rootRef} className="w-full">
      <div
        key={modeFlash}
        className={`lab-bay w-full ${modeFlash ? "cs-mode-flash" : ""}`}
        data-mode={mode}
      >
        {/* Top chrome — costume only */}
        <div className="lab-top-chrome" data-armed={armed ? "true" : "false"}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              <span className="live-dot" aria-hidden />
              {armed ? "MODEL" : "DORMANT"} {modelClock}
            </span>
            <span className="sep text-[var(--ink-3)]">·</span>
            <span>SEED {seedHex(SEED)}</span>
            <span className="sep text-[var(--ink-3)]">·</span>
            <span>
              ROUND {String(armed ? displayRound : 0).padStart(2, "0")}/{ROUNDS}
            </span>
          </div>
          <button
            type="button"
            className="lab-plain-toggle"
            aria-pressed={plain}
            onClick={() => setPlain((p) => !p)}
          >
            Plain labels
          </button>
        </div>

        {/* Arm banner + status chip */}
        <div className="lab-arm-banner" data-armed={armed ? "true" : "false"}>
          <span>
            {armed
              ? "LAB ARMED · twelve rounds"
              : "LAB DORMANT · scroll into view to run twelve rounds"}
          </span>
          <span
            className="lab-status-chip cs-tick"
            key={tickKey}
            data-armed={armed ? "true" : "false"}
          >
            <span>cost {fmt(cost)}</span>
            <span className="sep">·</span>
            <span>{params.signalsPerWatcher} sig/watcher</span>
            <span className="sep">·</span>
            <span>{Math.round(m.retention * 100)}% craft</span>
          </span>
        </div>

        {/* Intro inside bay */}
        <div className="flex flex-col gap-4 border-b border-[var(--line)] px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10 sm:px-6">
          <div className="max-w-xl">
            <h3 className="font-display text-[1.65rem] font-medium leading-tight tracking-tightish text-[var(--ink)] sm:text-[1.9rem]">
              One price, three numbers.
            </h3>
          </div>
          <p className="max-w-md font-sans text-[14px] leading-[1.55] text-[var(--ink-2)] sm:pb-1">
            A market of {CREATORS} creators and {WATCHERS} watchers, run for{" "}
            {ROUNDS === 12 ? "twelve" : ROUNDS} rounds. The only thing you
            control is what a signal costs the person sending it. Everything
            else follows.
          </p>
        </div>

        {/* Two-panel mechanism */}
        <div className="grid lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.35fr)]">
          {/* Left — cost control */}
          <div className="flex flex-col border-b border-[var(--line)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="text-[11px] font-medium tracking-[0.08em] text-[var(--ink-3)]">
              WHAT ONE SIGNAL COSTS THE SENDER
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {PRESET_ORDER.map((id) => {
                const p = PRESETS[id];
                const active = nearest === id && Math.abs(cost - p.cost) < 0.03;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreset(id)}
                    className="border px-2.5 py-1.5 text-[10px] font-medium tracking-[0.08em] transition-colors"
                    style={{
                      borderColor: active ? "var(--gold)" : "var(--line-strong)",
                      color: active ? "var(--gold)" : "var(--ink-3)",
                      background: active
                        ? "rgb(196 163 90 / 8%)"
                        : "transparent",
                    }}
                  >
                    {p.label.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {isDesktop === true ? (
              <div className="lab-desktop-slider mt-8">
                <CostSlider
                  cost={cost}
                  onCost={onCost}
                  onSettle={onSettle}
                  setPreset={setPreset}
                />
              </div>
            ) : null}

            <p className="mt-6 font-sans text-[13px] leading-[1.55] text-[var(--ink-2)]">
              {narrativeFor(params)
                .split(/(\d+)/)
                .map((part, i) =>
                  /^\d+$/.test(part) ? (
                    <strong key={i} className="font-medium text-[var(--ink)]">
                      {part}
                    </strong>
                  ) : (
                    <span key={i}>{part}</span>
                  ),
                )}
            </p>

            <dl className="mt-6 space-y-1.5 font-mono text-[12px] tabular text-[var(--ink)]">
              {paramRows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-[var(--ink-3)]">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={replay}
              className="mt-8 border border-[var(--line-strong)] px-3 py-2 text-[11px] font-medium tracking-[0.08em] text-[var(--ink-2)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              REPLAY TWELVE ROUNDS
            </button>

            <p className="mt-4 text-[11px] leading-snug text-[var(--ink-3)]">
              Numbers from a seeded model ({CREATORS} creators / {WATCHERS}{" "}
              watchers / {ROUNDS} rounds) — not live telemetry.
            </p>
          </div>

          {/* Right — scatter */}
          <div className="lab-scatter-bleed relative min-h-[320px] bg-[var(--canvas-2)] p-2 sm:min-h-[360px] sm:p-3">
            <span className="lab-mode-tag">{modeTag(mode)}</span>
            <ScatterPlot snapshot={snapshot} dormant={!armed} />
          </div>
        </div>

        {/* Outcomes strip */}
        <div className="border-t border-[var(--line)]">
          <div className="grid sm:grid-cols-3">
            {(
              [
                {
                  key: "sn" as const,
                  metricKey: "signalToNoise" as const,
                  value: fmt(m.signalToNoise),
                  gold: false,
                  bar: m.signalToNoise,
                  spark: sparkSeries.sn,
                  blurb:
                    "How well reach tracks quality — 1.00 means the best work is the most seen; 0 means reach is random.",
                },
                {
                  key: "worth" as const,
                  metricKey: "worth" as const,
                  value: fmt(m.worth),
                  gold: true,
                  bar: m.worth,
                  spark: sparkSeries.worth,
                  blurb:
                    "Share of signals landing on top-third quality work — 1.00 means a signal is proof; 0 means it is confetti.",
                },
                {
                  key: "ret" as const,
                  metricKey: "retention" as const,
                  value: `${Math.round(m.retention * 100)}%`,
                  gold: false,
                  bar: m.retention,
                  spark: sparkSeries.ret,
                  blurb: "When good work stays unseen, craft leaves — cheaper markets keep fewer.",
                  extra: (
                    <span className="ml-3 font-mono text-[1rem] tabular text-[var(--ink-3)]">
                      {m.craftStill} OF {m.craftStart}
                    </span>
                  ),
                },
              ] as const
            ).map((card, idx) => {
              const labels = outcomeLabels[card.key]!;
              const changed =
                armed && displayRound >= ROUNDS
                  ? deltaCaption(card.metricKey, m, prevMetrics)
                  : null;
              return (
                <div
                  key={card.key}
                  className={
                    idx < 2
                      ? "border-b border-[var(--line)] p-5 sm:border-b-0 sm:border-r sm:p-6"
                      : "p-5 sm:p-6"
                  }
                >
                  <div className="flex justify-between gap-2 text-[10px] font-medium tracking-[0.08em] text-[var(--ink-3)]">
                    <span>{labels.title}</span>
                    <span className="shrink-0">{labels.sub}</span>
                  </div>
                  <div
                    className="mt-3 flex items-baseline text-[2.4rem] font-medium tabular leading-none tracking-tightish font-courier"
                    style={{
                      color: card.gold ? "var(--gold)" : "var(--ink)",
                      fontFamily:
                        "var(--font-courier), 'Courier Prime', var(--font-mono), monospace",
                    }}
                  >
                    <TypewriterValue
                      value={card.value}
                      strikeKey={strikeKey}
                    />
                    {"extra" in card ? card.extra : null}
                  </div>
                  <div className="cs-bar-track">
                    <div
                      className={`cs-bar-fill ${card.gold ? "is-gold" : ""}`}
                      style={{
                        width: armed ? `${Math.max(2, card.bar * 100)}%` : "0%",
                      }}
                    />
                  </div>
                  {changed ? (
                    <p
                      key={`${tickKey}-${card.key}`}
                      className="cs-tick mt-2 font-mono text-[11px] text-[var(--gold)]"
                    >
                      {changed}
                    </p>
                  ) : (
                    <p className="mt-2 font-mono text-[11px] text-[var(--ink-3)]">
                      {armed ? "Settle the slider to compare" : "Waiting to arm"}
                    </p>
                  )}
                  <p className="mt-3 text-[12px] leading-snug text-[var(--ink-3)]">
                    {card.blurb}
                  </p>
                  <Sparkline
                    values={card.spark}
                    color={card.gold ? "var(--gold)" : "#f2f2f0"}
                    dashed={card.key === "ret"}
                  />
                </div>
              );
            })}
          </div>

          <PriceChart curve={run.priceCurve} cost={cost} metrics={m} />
        </div>

        {/* Mobile sticky dock — CostSlider only below lg */}
        <div className="lab-mobile-dock">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[0.08em] text-[var(--ink-3)]">
              COST · {fmt(cost)}
            </span>
            <span className="font-mono text-[10px] tracking-[0.08em] text-[var(--gold)]">
              {modeTag(mode)}
            </span>
          </div>
          {isDesktop === false ? (
            <CostSlider
              cost={cost}
              onCost={onCost}
              onSettle={onSettle}
              setPreset={setPreset}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
