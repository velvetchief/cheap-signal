# Critique pass — mapping Prithvi’s points → changes

**Date:** 2026-09-25 PT  
**Scope:** In-place rebuild of `/workspace/cheap-signal-drop` (no second drop).

| # | Critique | What changed |
|---|---|---|
| 1 | Headline number barely moves when dragging slider | Replaced “portfolio quality” with **costly share of what the feed pays** = costly_stack / (cheap_stack + costly_stack). Moves from ~0% (Cheap feed) to ~100% (Costly). Also shows **Top of feed pays for: {label}**, which flips across regimes. |
| 2 | Vanity / conviction stack bars don’t move; sums ignore t | Stacks are now **T-dependent**: `cheap_stack = T × Σ vanity×conf`, `costly_stack = (1−T) × Σ conviction×conf`. Bars and numeric sums both change on drag. |
| 3 | Leading with Instagram like as top “quality”; “59 for a like” wrong | Renamed to **what the feed pays** throughout. Default regime = **Mixed (T=0.5)** so like is not crowned on load. Killed quality /q / 59-for-a-like reading. |
| 4 | Cosign is NOT the scarcest — IRL invite beats it | Scarcity order rewritten (high→low): IRL invite / hire / check → private would-work-with → public cosign with specific why → list → LinkedIn endorsement / drive-by repost → like. Added `hire_or_check`, `private_www`, `irl_invite` above public cosign in labels and scores. |
| 5 | Thesis “platforms that make a signal easy destroy it” implies Cosign fails if it works at scale | Reframes to **cost collapse** (reciprocal, zero-stakes, unlimited). Explicit: Cosign *should* make reputation/intros/access easier; it fails only if belief becomes costless. |
| 6 | LinkedIn endorsements are the deciding counterexample | New section **05 · Why LinkedIn endorsements died** + **What would make a Cosign costly**. Research sources L1–L5 in `01-research.md`. LinkedIn skill endorsement added as a hand-labeled cheap-attestation signal. |
| 7 | Photographer exodus had other causes (Reels/format); don’t overclaim vanity-only | Proof case rewritten: vanity **and** format shift / ads / spam. Parallel to LinkedIn spam noted. |
| 8 | T has no real-world referent | **T defined** as estimated share of feed attention on zero-cost attestations. Observable regimes: Cheap feed (~0.85) / Mixed (0.5) / Costly commitments (~0.15). Moving 0.35→0.70 = more attention on zero-cost attestations. |
| 9 | Residue venues are snapshot, not stable end state | Copy + research: Flickr hollowed before; Substack/Discord can same arc. Non-claim added. |

## Fix-direction checklist

- [x] Stacks **and** ranking respond to T (kept continuum + discrete regimes)
- [x] “Quality” → “what the feed pays”
- [x] Kill fifty-nine-for-a-like reading
- [x] Course/section on costly cosign + LinkedIn head-on
- [x] Separate cheap cosigns (tweet/repost) from expensive (hire/check/IRL)
- [x] Define T (not remove)

## Files touched

- `00-brief.md`, `01-research.md`, `02-scoring.md` (rewritten)
- `03-critique-pass.md` (this file)
- `app/src/lib/signals.ts`, `app/src/components/SignalLab.tsx`, `app/src/components/Drop.tsx`
- Note (2026-09-26): `signals.ts` T-stacks were critique scaffolding only — **shipped lab is `marketSim.ts` only** (signals.ts deleted).
