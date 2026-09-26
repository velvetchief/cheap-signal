# Cheap Signal — Scoring Schema

**Method:** Hand-label and score social-graph and endorsement signals with an inspectable schema — not a black-box essay.

**Job of the schema:** Drive the interactive viz with transparent, inspectable scores. Not a black-box AI essay. Dragging **T** must visibly re-rank signals and move both stacks.

---

## Continuum **T** (defined — not abstract Volume↔Belief)

**T = estimated share of feed attention paid to zero-cost attestations.**

| T | Regime | Observable reading |
|---|---|---|
| ≈ 0.85 | **Cheap feed** | Likes, views, reciprocal endorsements, drive-by reposts absorb most attention |
| ≈ 0.50 | **Mixed** | Split attention between attestations and commitments |
| ≈ 0.15 | **Costly commitments** | Hire / check / IRL invite / specific named vouch dominate what people act on |

Moving T from 0.35 → 0.70 means: a larger share of attention in the environment is going to signals that cost almost nothing to mint (likes, LinkedIn skill taps, low-stakes reposts) rather than to costly commitments. It is a **cost-floor / attention-mix** dial — not a mystical Belief↔Volume vibe.

---

## Dimensions (every signal gets all four)

### 1. `kind` — what sort of thing is this?

| Kind | Definition | Examples |
|---|---|---|
| `vanity_metric` | Countable attention residue with little cost to produce | like, view, follower tally |
| `engagement_bait` | Behavior shaped to farm the metric | trend Reel, F4F comment, grid conformity |
| `cheap_attestation` | Public name-ish belief with near-zero downside | LinkedIn skill endorsement, drive-by repost |
| `ambient_affiliation` | Soft public association without commitment | follow, casual reply |
| `craft_feedback` | Time-costly, skill-relevant response | technique critique |
| `owned_attention` | Audience relationship the creator controls | paid sub, site visit |
| `seat_scarce` | Finite place; host pays reputation or logistics | Discord seat, IRL invite |
| `economic_binding` | Money or contract attached | commission, hire, angel check |
| `named_belief` | Attributable human vouch with reputation exposure | specific public cosign, warm intro, private would-work-with |

### 2. `cheapness` — how easy is this signal to mint at scale? (0–1)

- **1.0** = near-zero marginal cost, infinite supply, often reciprocal
- **0.5** = some time or context cost, still abundant
- **0.0** = scarce by construction (hire, check, IRL invite)

Cheapness rises with automation, anonymity, reciprocity loops, and lack of downside for false positives.

### 3. `attributable_human_belief` — can a specific person be held to this signal? (0–1)

- **1.0** = named person, public or semi-public stake, reputation (or money) on the line
- **0.5** = identifiable but low-stakes
- **0.0** = anonymous, aggregate, or metric with no accountable human

### 4. `confidence` — how sure are we in this label? (0–1)

Hand-labeled ideals get high confidence. Context-dependent signals get lower. The viz dims low-confidence cards rather than inventing precision.

---

## Derived scores

### Cheap-attestation weight (internal)

```
vanity = cheapness * (1 - attributable_human_belief)
```

High when abundant and unaccountable.

### Costly-commitment weight (internal)

```
conviction = (1 - cheapness) * attributable_human_belief
```

High when scarce and name-/money-backed.

### What the feed pays (replaces “quality”)

Honest label: this is **not** how good the signal is. It is how much the **current regime** rewards that signal.

```
what_feed_pays(signal, t) =
  t * vanity(signal)
+ (1 - t) * conviction(signal)
```

At high **T** (cheap feed), zero-cost attestations rise. At low **T** (costly commitments), hire / check / IRL invite rise. Default Mixed so Instagram like is **not** crowned on first paint.

### Stacks that move with T

```
cheap_stack(t)  = t       * Σ vanity(s) * confidence(s)
costly_stack(t) = (1 - t) * Σ conviction(s) * confidence(s)
```

Both bar heights and numeric sums depend on **T**. Dragging must change them.

### Headline readout (moves hard)

```
costly_share(t) = costly_stack(t) / (cheap_stack(t) + costly_stack(t))
```

Plus the current **top-of-feed** label under `what_feed_pays`. Kill any “59 for a like = quality” reading.

---

## Scarcity order (belief cost, high → low)

1. IRL invite / hire / write a check  
2. Private would-work-with  
3. Public attributed cosign **with specific why**  
4. List inclusion  
5. LinkedIn skill endorsement / drive-by tweet-repost  
6. Like / view  

Public cosign is **not** the scarcest signal. IRL invite and economic commitment beat it.

---

## Hand-labeled ideal set (v2 — drives the drop)

| id | label | kind | cheapness | belief | confidence | notes |
|---|---|---|---|---|---|---|
| like | Instagram like | vanity_metric | 0.95 | 0.05 | 0.9 | Near-zero cost; anonymous aggregate |
| follower | Follower count | vanity_metric | 0.85 | 0.10 | 0.85 | Gameable legitimacy proxy |
| reel_view | Reel view | vanity_metric | 0.90 | 0.05 | 0.8 | Algorithm-favored volume |
| spam_comment | “Nice pic / F4F” comment | engagement_bait | 0.92 | 0.05 | 0.85 | High volume, no craft |
| linkedin_endorse | LinkedIn skill endorsement | cheap_attestation | 0.92 | 0.10 | 0.9 | Reciprocal, zero-stakes; classic cost collapse |
| tweet_repost | Drive-by tweet / repost “cosign” | cheap_attestation | 0.85 | 0.25 | 0.8 | Public but low downside — cheap cosign |
| grid_conform | Aesthetic grid conformity | engagement_bait | 0.70 | 0.15 | 0.7 | Self-censorship for performance |
| technique_critique | Flickr group technique note | craft_feedback | 0.35 | 0.55 | 0.8 | Time + skill cost |
| list_inclusion | Curated list inclusion | ambient_affiliation | 0.45 | 0.55 | 0.7 | Some curation cost; still scalable |
| glass_scroll | Glass chronological catch-up | owned_attention | 0.40 | 0.35 | 0.65 | Low algo pressure; medium binding |
| substack_paid | Paid Substack subscription | owned_attention | 0.25 | 0.75 | 0.85 | Money + ongoing attention |
| discord_seat | Active Discord membership | seat_scarce | 0.30 | 0.60 | 0.75 | Finite community; host curation |
| public_cosign | Public cosign with specific why | named_belief | 0.22 | 0.90 | 0.9 | Costly only if specific + reputation-exposed |
| private_www | Private “would work with” | named_belief | 0.18 | 0.92 | 0.85 | Semi-private stake; harder to fake |
| warm_intro | Warm introduction | named_belief | 0.18 | 0.92 | 0.9 | Introducer’s reputation exposed |
| client_commission | Named client commission | economic_binding | 0.12 | 0.88 | 0.9 | Reputation + money |
| hire_or_check | Hire / write a check / seed | economic_binding | 0.05 | 0.98 | 0.95 | What builders and capital allocators need |
| irl_invite | Scarce IRL invite | seat_scarce | 0.08 | 0.96 | 0.9 | Seats finite; host stake — beats public cosign |

*Scores are hand labels for the drop — not measured platform telemetry. Mark as such in the lab note.*

---

## How the interactive uses this

1. Regime presets (Cheap feed / Mixed / Costly commitments) set **T**; slider fine-tunes.
2. Re-rank cards by `what_feed_pays(s, t)` — label shown as **What the feed pays**, never “quality.”
3. Cheap stack and costly stack use the **T-dependent** formulas above so bars and sums move.
4. Headline: `costly_share(t)` + “Top of feed pays for: {label}.”
5. At Costly, hire / IRL / private would-work-with lead. At Cheap, like / LinkedIn endorsement / reel view lead. Mixed default avoids crowning a like on load.

---

## Schema checks

- If stacks do not change when T moves → broken (v1 failure mode).
- If “quality” language returns → rename again.
- If public cosign outranks IRL invite / hire at Costly → scarcity order wrong.
- If LinkedIn endorsement is missing from the cheap end → counterexample invisible.
- If Cosign appears as “more engagement,” attributable belief / cost was underweighted.
