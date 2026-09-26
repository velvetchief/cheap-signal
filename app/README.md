# Cheap Signal

Interactive editorial drop on cheap signals versus costly belief. Instagram photographers are the case; Cosign is the scarce-name control. This is not a Cosign product clone.

## Paths

| Path | Contents |
|---|---|
| [`../00-brief.md`](../00-brief.md) | Drop brief |
| [`../01-research.md`](../01-research.md) | Cited evidence and non-claims |
| [`../02-scoring.md`](../02-scoring.md) | Signal scoring notes |
| `.` | Next.js drop (this folder) |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start:prod   # next start -p 3001 (use when :3000 is already taken by dev)
# or: PORT=3001 npm start
```

Security headers live in `next.config.ts` (`poweredByHeader: false`, nosniff, Referrer-Policy, DENY / `frame-ancestors 'none'`, lite CSP). Fonts use `next/font/google` (self-hosted at build), so CSP does not need `fonts.googleapis.com`.

### Interim share (cloudflared quick tunnel)

Quick tunnels are ephemeral — a temporary share URL only:

```bash
# from repo root, with production already on :3001
./cloudflared tunnel --url http://127.0.0.1:3001
```

The `cloudflared` binary is gitignored at repo root.

## Deploy

Root the Vercel project at `app/` (framework: Next.js). No environment variables required.

```bash
npx vercel
```

## The drop

- A signed letter: a name on paper still costs an afternoon.
- A cost slider: one control sets what a signal costs the sender. A seeded market shows whether reach still tracks craft, or whether the people who cared leave.
- LinkedIn punchline: endorsements as cheap belief that collapsed, and what keeps a cosign expensive.
- Sources: the receipts the piece cites.

## Notes

- Lab numbers come from a seeded twelve-round market model (creators, watchers, cost) — not live telemetry.
- Do not invent product names or fabricate stats.
