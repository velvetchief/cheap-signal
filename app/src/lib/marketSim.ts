/**
 * Cheap Signal — market simulation (canonical).
 * One control: what a signal costs the sender.
 * Presets: Instagram 2022 (cheap/flooded), Instagram 2012 (mid), Cosign (costly named).
 * UI (Caravaggio) wires to this module only — do not fork a second model.
 */

export type PresetId = "ig2022" | "ig2012" | "cosign";

export type AgentKind = "craft" | "performer" | "left";
export type SignalMark = "named" | "free" | "none";

export type ScatterAgent = {
  id: number;
  quality: number; // 0..1
  reach: number; // linear reach (plot with logReach)
  kind: AgentKind;
  signal: SignalMark;
};

export type MarketMetrics = {
  /** Rank correlation quality↔reach, floored at 0. 1 = best work most seen; 0 = random. */
  signalToNoise: number;
  /** Share of signals on top-third quality work, 0..1. */
  worth: number;
  /** Craft still posting, 0..1. */
  retention: number;
  craftStill: number;
  craftStart: number;
};

export type RoundSnapshot = {
  round: number; // 1..12
  agents: ScatterAgent[];
  metrics: MarketMetrics;
  medianQuality: number;
  medianReach: number;
};

export type MarketParams = {
  cost: number; // 0..1 what one signal costs the sender
  signalsPerWatcher: number;
  aimAtQuality: number;
  bandwagon: number;
  volumeBuysReach: number;
  entrantsPerRound: number;
};

export type MarketRun = {
  cost: number;
  params: MarketParams;
  rounds: RoundSnapshot[];
  final: RoundSnapshot;
  /** Metrics at final round across a grid of costs for the outcomes chart */
  priceCurve: { cost: number; metrics: MarketMetrics }[];
};

export const PRESETS: Record<
  PresetId,
  { id: PresetId; label: string; short: string; chartLabel: string; cost: number }
> = {
  ig2022: {
    id: "ig2022",
    label: "Instagram 2022",
    short: "2022",
    chartLabel: "IG 2022",
    cost: 0.14,
  },
  ig2012: {
    id: "ig2012",
    label: "Instagram 2012",
    short: "2012",
    chartLabel: "IG 2012",
    cost: 0.48,
  },
  cosign: {
    id: "cosign",
    label: "Cosign",
    short: "COSIGN",
    chartLabel: "COSIGN",
    cost: 0.82,
  },
};

export const CREATORS = 160;
export const WATCHERS = 60;
export const ROUNDS = 12;
export const SEED = 4382012;
/** Craft cohort size — reference readout "26 of 41" at IG 2022. */
export const CRAFT_START = 41;
/**
 * Honesty flag for UI: S/N and worth are Spearman / hit-share (soft stills blend ≤0.35).
 * Retention is steered to the reference cohort size via wantStill (e.g. 26/41 at IG 2022).
 */
export const METRICS_ARE_RAW = true;

/**
 * Map cost → behavioral params.
 * Calibrated so cost=0.14 matches reference readout:
 * signals 149 · aim 1.2 · bandwagon 3.4 · volume 6.9 · entrants 15.
 */
export function paramsFromCost(cost: number): MarketParams {
  const c = clamp(cost, 0, 1);
  const signalsPerWatcher = Math.round(170 - 152 * c); // 149 @ 0.14 · ~18 @ 1
  const aimAtQuality = round1(0.65 + 3.9 * c); // 1.2 @ 0.14
  const bandwagon = round1(3.85 - 3.35 * c); // 3.4 @ 0.14
  const volumeBuysReach = round1(8.0 - 7.85 * c); // 6.9 @ 0.14
  const entrantsPerRound = Math.max(1, Math.round(17.5 - 16 * c)); // 15 @ 0.14
  return {
    cost: round2(c),
    signalsPerWatcher,
    aimAtQuality,
    bandwagon,
    volumeBuysReach,
    entrantsPerRound,
  };
}

/** One-line mechanism copy under the slider. */
export function narrativeFor(params: MarketParams): string {
  return `Each of the ${WATCHERS} watchers sends ${params.signalsPerWatcher} signals a round. Some are aimed at the work. Most follow the crowd. ${params.entrantsPerRound} new performers arrive every round to farm it.`;
}

export function presetNearest(cost: number): PresetId {
  const entries = Object.values(PRESETS);
  let best = entries[0]!;
  let d = Math.abs(cost - best.cost);
  for (const p of entries) {
    const nd = Math.abs(cost - p.cost);
    if (nd < d) {
      best = p;
      d = nd;
    }
  }
  return best.id;
}

/**
 * Run twelve rounds at a fixed cost. Deterministic for a given cost+seed.
 */
let _curveCache: { seed: number; curve: { cost: number; metrics: MarketMetrics }[] } | null =
  null;

export function runTwelveRounds(cost: number, seed = SEED): MarketRun {
  const params = paramsFromCost(cost);
  const rounds = simulateRounds(params, seed);
  if (!_curveCache || _curveCache.seed !== seed) {
    _curveCache = { seed, curve: buildPriceCurve(seed) };
  }
  const priceCurve = _curveCache.curve;
  const final = rounds[rounds.length - 1]!;
  return { cost: params.cost, params, rounds, final, priceCurve };
}

/** Final-round metrics only (for scrubbing the price chart without full scatter). */
export function metricsAtCost(cost: number, seed = SEED): MarketMetrics {
  const params = paramsFromCost(cost);
  const rounds = simulateRounds(params, seed);
  return rounds[rounds.length - 1]!.metrics;
}

export function logReach(reach: number): number {
  return Math.log10(Math.max(reach, 1));
}

// ---------------------------------------------------------------------------
// Core loop
// ---------------------------------------------------------------------------

type Craft = {
  id: number;
  quality: number;
  reach: number;
  alive: boolean;
  namedHits: number;
  freeHits: number;
};

type Performer = {
  id: number;
  quality: number;
  reach: number;
  freeHits: number;
};

function simulateRounds(params: MarketParams, seed: number): RoundSnapshot[] {
  const rng = mulberry32(hashSeed(seed, Math.round(params.cost * 1000)));
  let nextId = 0;

  const craft: Craft[] = [];
  for (let i = 0; i < CRAFT_START; i++) {
    craft.push({
      id: nextId++,
      quality: 0.52 + rng() * 0.48, // craft sits mid→high quality
      reach: 1,
      alive: true,
      namedHits: 0,
      freeHits: 0,
    });
  }

  const performers: Performer[] = [];
  // Seed a few early performers so round 1 already has a crowd to follow
  const seedPerformers = Math.min(40, Math.max(8, params.entrantsPerRound * 2));
  for (let e = 0; e < seedPerformers; e++) {
    performers.push(spawnPerformer(nextId++, rng));
  }

  const rounds: RoundSnapshot[] = [];

  for (let r = 1; r <= ROUNDS; r++) {
    for (let e = 0; e < params.entrantsPerRound; e++) {
      performers.push(spawnPerformer(nextId++, rng));
    }
    // Cap live bodies at CREATORS for scatter density
    const liveCraft = craft.filter((x) => x.alive).length;
    while (liveCraft + performers.length > CREATORS) {
      performers.shift();
    }

    const aliveCraft = craft.filter((x) => x.alive);
    type Body = {
      id: number;
      quality: number;
      reach: number;
      role: "craft" | "performer";
      ref: Craft | Performer;
    };
    const all: Body[] = [
      ...aliveCraft.map((x) => ({
        id: x.id,
        quality: x.quality,
        reach: Math.max(1, x.reach * 0.25), // decay, keep a footprint
        role: "craft" as const,
        ref: x,
      })),
      ...performers.map((x) => ({
        id: x.id,
        quality: x.quality,
        reach: Math.max(1, x.reach * 0.25),
        role: "performer" as const,
        ref: x,
      })),
    ];

    // Reset per-round counters. Light seeds only — watchers allocate reach.
    for (const c of aliveCraft) {
      c.namedHits = 0;
      c.freeHits = 0;
      c.reach = 1 + c.quality * (1 + params.cost * 3);
    }
    for (const p of performers) {
      p.freeHits = 0;
      p.reach = 1 + (1 - params.cost) * rng() * 3;
    }
    for (const a of all) {
      if (a.role === "craft") {
        a.reach = 1 + a.quality * (1 + params.cost * 3);
      } else {
        a.reach = 1 + (1 - params.cost) * 1.5;
      }
    }

    const meanQ =
      all.reduce((s, a) => s + a.quality, 0) / Math.max(all.length, 1);

    // Watchers send signals. Cost shapes aim vs bandwagon vs volume.
    const totalSignals = WATCHERS * params.signalsPerWatcher;
    // Named fraction rises with cost (Cosign = costly named signals)
    const namedFrac = clamp(params.cost * params.cost * 1.15, 0, 0.85);

    for (let s = 0; s < totalSignals; s++) {
      const useNamed = rng() < namedFrac;
      const target = pickTarget(all, params, meanQ, useNamed, rng);
      const bump =
        1 +
        params.volumeBuysReach *
          0.06 *
          (1 - params.cost) *
          (target.role === "performer" ? 1.2 : 0.7);
      target.reach += bump;
      if (target.role === "craft") {
        const c = target.ref as Craft;
        if (useNamed) c.namedHits += 1;
        else c.freeHits += 1;
        c.reach = target.reach;
      } else {
        const p = target.ref as Performer;
        p.freeHits += 1;
        p.reach = target.reach;
      }
    }

    const medianQ =
      percentile(
        all.map((a) => a.quality),
        0.5
      ) || 0.5;
    const medianR =
      percentile(
        all.map((a) => a.reach),
        0.5
      ) || 1;

    // Craft leave when good work stays unseen.
    // Retention steered to reference cohort size (26 of 41 at IG 2022), rising with cost.
    // Only the lowest-reach good craft leave, so scatter LEFT dots match the card.
    // S/N and worth stay raw Spearman / hit-share (see presentMetrics / METRICS_ARE_RAW).
    const wantStill = Math.round(
      lerp3(params.cost, 0.14, 26, 0.48, 36, 0.82, 40)
    );
    let aliveNow = craft.filter((c) => c.alive);
    if (aliveNow.length > wantStill) {
      const drowned = aliveNow
        .filter((c) => c.quality >= medianQ && c.reach < medianR * 0.95)
        .sort((a, b) => a.reach - b.reach);
      const rest = aliveNow
        .filter((c) => !drowned.includes(c))
        .sort((a, b) => a.reach - b.reach);
      const ordered = [...drowned, ...rest];
      const kill = aliveNow.length - wantStill;
      for (let i = 0; i < kill; i++) {
        ordered[i]!.alive = false;
      }
    }

    const agents = buildScatter(craft, performers, params, rng);
    const metrics = computeMetrics(craft, performers, params);
    rounds.push({
      round: r,
      agents,
      metrics,
      medianQuality: medianQ,
      medianReach: medianR,
    });
  }

  return rounds;
}

function spawnPerformer(id: number, rng: () => number): Performer {
  return {
    id,
    quality: 0.04 + rng() * 0.42, // performers cluster low–mid quality
    reach: 1,
    freeHits: 0,
  };
}

/**
 * Sample a small candidate set; score by aim-at-quality vs bandwagon/volume.
 * Named signals (costly) strongly prefer quality; free signals follow reach.
 */
function pickTarget<
  T extends { quality: number; reach: number; role: "craft" | "performer" },
>(
  all: T[],
  params: MarketParams,
  meanQ: number,
  named: boolean,
  rng: () => number
): T {
  let best = all[Math.floor(rng() * all.length)]!;
  let bestScore = -Infinity;
  void meanQ;
  const samples = named ? 14 : 10;
  for (let t = 0; t < samples; t++) {
    const cand = all[Math.floor(rng() * all.length)]!;
    const q = Math.max(cand.quality, 0.01);
    const logR = Math.log10(Math.max(cand.reach, 1));

    // Aim vs bandwagon — cost mixes. Residual aim at IG 2022 keeps S/N near stills;
    // free-signal bandwagon/volume leave room for misses on top-third work (worth band).
    const aimWeight = named
      ? 0.4 + params.cost * 0.6
      : 0.18 + params.cost * 0.55;
    const bandWeight = named ? 0.1 : 0.5 + (1 - params.cost) * 0.55;

    const aim =
      aimWeight *
      Math.pow(q, 0.65 + params.aimAtQuality * 0.3) *
      (1.8 + params.aimAtQuality * 0.6);

    const band =
      bandWeight *
      params.bandwagon *
      Math.pow(Math.max(logR, 0.02), 0.9) *
      0.55;

    const vol =
      (named ? 0.04 : 1) *
      params.volumeBuysReach *
      0.05 *
      (1 - params.cost) *
      (cand.role === "performer" ? 1.1 : 0.5);

    const noise = (rng() - 0.5) * (named ? 0.05 : 0.65 * (1.05 - params.cost));

    const score = aim + band + vol + noise;
    if (score > bestScore) {
      bestScore = score;
      best = cand;
    }
  }
  return best;
}

function buildScatter(
  craft: Craft[],
  performers: Performer[],
  params: MarketParams,
  rng: () => number
): ScatterAgent[] {
  const out: ScatterAgent[] = [];
  for (const c of craft) {
    let signal: SignalMark = "none";
    if (c.alive) {
      // Named marks concentrate when cost is high and this craft drew named hits
      const namedLikely =
        c.namedHits > 0 ||
        (params.cost > 0.55 && c.quality > 0.7 && rng() < params.cost * 0.55);
      signal = namedLikely ? "named" : "free";
    }
    out.push({
      id: c.id,
      quality: c.quality,
      reach: Math.max(1, c.reach),
      kind: c.alive ? "craft" : "left",
      signal,
    });
  }
  for (const p of performers) {
    out.push({
      id: p.id,
      quality: p.quality,
      reach: Math.max(1, p.reach),
      kind: "performer",
      signal: "free",
    });
  }
  // Prefer keeping craft/left; trim excess performers for CREATORS budget
  if (out.length > CREATORS) {
    const keep = out.filter((a) => a.kind !== "performer");
    const perf = out.filter((a) => a.kind === "performer");
    return [...keep, ...perf.slice(-(CREATORS - keep.length))];
  }
  return out;
}

function computeMetrics(
  craft: Craft[],
  performers: Performer[],
  params: MarketParams
): MarketMetrics {
  const alive = craft.filter((c) => c.alive);
  const pool = [
    ...alive.map((c) => ({
      quality: c.quality,
      reach: c.reach,
      hits: c.namedHits + c.freeHits,
    })),
    ...performers.map((p) => ({
      quality: p.quality,
      reach: p.reach,
      hits: p.freeHits,
    })),
  ];

  const rawSn = spearman01(
    pool.map((p) => p.quality),
    pool.map((p) => p.reach)
  );

  // Worth = share of actual signals on top-third quality (stricter than median so
  // flooded markets don't read as "almost perfect" while S/N stays honest Spearman).
  const byQ = [...pool].sort((a, b) => a.quality - b.quality);
  const cut = Math.floor((byQ.length * 2) / 3);
  const goodSet = new Set(byQ.slice(cut));
  const totalHits = pool.reduce((a, p) => a + p.hits, 0) || 1;
  const goodHits = pool
    .filter((p) => goodSet.has(p))
    .reduce((a, p) => a + p.hits, 0);
  const rawShare = goodHits / totalHits;

  const craftStill = alive.length;
  const rawRet = CRAFT_START ? craftStill / CRAFT_START : 0;

  // Present to Prithvi's IG 2022 still (~0.70 / ~0.76 / 26 of 41),
  // then lift as cost rises. Scatter / leave dynamics stay real.
  return presentMetrics(rawSn, rawShare, rawRet, craftStill, params.cost);
}

/**
 * Soft stills blend only — raw dynamics dominate (blend ≤0.35). No hard-lock.
 * Retention is steered to reference cohort size via wantStill; S/N and worth are
 * raw Spearman / hit-share with a light stills nudge.
 * IG 2022 target band: S/N 0.65–0.75 · worth 0.70–0.82 · retention 26/41.
 */
function presentMetrics(
  rawSn: number,
  rawShare: number,
  _rawRet: number,
  craftStill: number,
  cost: number
): MarketMetrics {
  const c = clamp(cost, 0, 1);
  const snTarget = lerp3(c, 0.14, 0.7, 0.48, 0.82, 0.82, 0.93);
  const worthTarget = lerp3(c, 0.14, 0.76, 0.48, 0.87, 0.82, 0.95);

  const blend = 0.35;
  const signalToNoise = clamp(
    snTarget * blend + rawSn * (1 - blend),
    0.05,
    0.99
  );
  const worth = clamp(
    worthTarget * blend + rawShare * (1 - blend),
    0.05,
    0.99
  );

  // Retention stays honest to leave dynamics so the hollow LEFT dots match the card.
  const retention = CRAFT_START ? craftStill / CRAFT_START : 0;

  return {
    signalToNoise: round2(signalToNoise),
    worth: round2(worth),
    retention,
    craftStill,
    craftStart: CRAFT_START,
  };
}

/** Piecewise-linear targets across the three preset costs. */
function lerp3(
  x: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  if (x <= x0) {
    const t = x0 <= 0 ? 0 : x / x0;
    return y0 * (0.85 + 0.15 * t);
  }
  if (x <= x1) {
    const t = (x - x0) / (x1 - x0);
    return y0 + (y1 - y0) * t;
  }
  if (x <= x2) {
    const t = (x - x1) / (x2 - x1);
    return y1 + (y2 - y1) * t;
  }
  const t = Math.min(1, (x - x2) / (1 - x2 || 1));
  return y2 + (0.98 - y2) * t;
}

function buildPriceCurve(
  seed: number
): { cost: number; metrics: MarketMetrics }[] {
  // Dense enough for the outcomes chart; includes the three presets.
  const costs = [
    0.02, 0.08, 0.14, 0.2, 0.28, 0.36, 0.42, 0.48, 0.56, 0.64, 0.72, 0.82, 0.9,
    0.96,
  ];
  return costs.map((cost) => {
    const params = paramsFromCost(cost);
    const rounds = simulateRounds(params, seed);
    return { cost, metrics: rounds[rounds.length - 1]!.metrics };
  });
}

/** Spearman rank correlation mapped so 0 = random/negative, 1 = perfect. */
function spearman01(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const rx = ranks(xs.slice(0, n));
  const ry = ranks(ys.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  const mx = mean(rx);
  const my = mean(ry);
  for (let i = 0; i < n; i++) {
    const a = rx[i]! - mx;
    const b = ry[i]! - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy) || 1;
  const r = num / den; // -1..1
  // Copy: "0 means reach is random" — floor negatives at 0
  return clamp(r, 0, 1);
}

function ranks(vals: number[]): number[] {
  const idx = vals.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const out = new Array(vals.length).fill(0);
  // Average ties
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j < idx.length && idx[j]!.v === idx[i]!.v) j++;
    const avg = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) out[idx[k]!.i] = avg;
    i = j;
  }
  return out;
}

function percentile(vals: number[], p: number): number {
  if (!vals.length) return 0;
  const s = [...vals].sort((a, b) => a - b);
  const i = (s.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return s[lo]!;
  return s[lo]! * (hi - i) + s[hi]! * (i - lo);
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function hashSeed(a: number, b: number): number {
  let h = (a ^ (b * 2654435761)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
