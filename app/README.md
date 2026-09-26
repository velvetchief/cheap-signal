# Cheap Signal — Interactive Drop

MTS Drops–style editorial briefing for Prithvi Datla’s a16z Cosign / New Media Senior Product Engineer audition.

**Thesis:** When signals get cheap, the people who cared leave. Instagram hollowed photographer craft via volume/vanity metrics; Cosign’s bet is scarce name-backed belief.

This is **not** a Cosign clone, RFP app, or landing page.

## Paths

| Path | Contents |
|---|---|
| `/workspace/cheap-signal-drop/00-brief.md` | One-liner, emotional job, outline, non-goals, kill tests |
| `/workspace/cheap-signal-drop/01-research.md` | Cited evidence + non-claims |
| `/workspace/cheap-signal-drop/02-scoring.md` | Signal scoring schema (Jev-style methodology mindset) |
| `/workspace/cheap-signal-drop/app` | Next.js interactive drop (this folder) |

## Run locally

```bash
cd /workspace/cheap-signal-drop/app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build (no Turbopack HMR)

```bash
npm run build
npm run start:prod   # next start -p 3001 (use when :3000 is already taken by dev)
# or: PORT=3001 npm start
```

Security headers live in `next.config.ts` (`poweredByHeader: false`, nosniff, Referrer-Policy, DENY / `frame-ancestors 'none'`, lite CSP). Fonts use `next/font/google` (self-hosted at build), so CSP does not need `fonts.googleapis.com`.

### Interim share (cloudflared quick tunnel)

Quick tunnels are ephemeral — fine for a temporary share URL only:

```bash
# from repo root, with prod already on :3001
./cloudflared tunnel --url http://127.0.0.1:3001
```

The `cloudflared` binary is gitignored at repo root.

## Deploy (durable host)

**Prefer Prithvi’s Vercel and/or a GitHub repo he owns.** There is no configured `git remote` and `gh` is not authenticated in this environment, so agents cannot create/push a public repo without his credentials (`gh auth login` + remote).

From `app/`:

```bash
npx vercel
```

Or connect the `cheap-signal-drop/app` directory as a Vercel project root (framework: Next.js). No env vars required for the static interactive briefing.

## Interaction

- Scroll sections: Hook → Mechanism → Photographer proof → Signal lab → Cosign punchline → Sources
- Primary control: Volume ↔ Belief continuum reweights hand-labeled signals
- Expand any signal card for kind / cheapness / attributable belief / confidence

## Notes

- Signal scores are **hand-labeled ideals** for demonstration — not platform telemetry.
- Do not invent closeness-widget brands or fabricate stats.
