import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Lite CSP for Next.js + next/font (self-hosted Google fonts at build time).
 * Allows 'unsafe-inline' for Next hydration/styles; no fonts.googleapis.com needed.
 * If a future third-party script breaks, tighten here rather than opening wildcards.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Dev-only: HMR / client must load through Cloudflare quick tunnels.
  ...(isDev
    ? {
        allowedDevOrigins: [
          "127.0.0.1",
          "localhost",
          "*.trycloudflare.com",
        ],
      }
    : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
