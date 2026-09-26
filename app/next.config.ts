import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Static CSP for this App Router essay (Next's non-nonce pattern).
 * 'unsafe-eval' is dev-only: React uses it for debug stacks, not in production.
 * 'unsafe-inline' stays for Next's static inline bootstrap, next/font, and
 * style attributes. A nonce would force dynamic rendering; nothing here
 * renders user-controlled HTML. script-src-attr 'none' still blocks
 * inline event handlers.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  // Dev may use a blob worker for tooling. Production does not.
  isDev ? "worker-src 'self' blob:" : "worker-src 'none'",
  "manifest-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const permissionsPolicy = [
  "accelerometer=()",
  "autoplay=()",
  "camera=()",
  "display-capture=()",
  "encrypted-media=()",
  "fullscreen=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "picture-in-picture=()",
  "publickey-credentials-get=()",
  "screen-wake-lock=()",
  "usb=()",
  "xr-spatial-tracking=()",
  "browsing-topics=()",
].join(", ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // Legacy XSS auditor is off; modern browsers ignore it and it has bypasses.
  { key: "X-XSS-Protection", value: "0" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "Permissions-Policy", value: permissionsPolicy },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // No includeSubDomains or preload: this repo does not name a host.
  // Browsers ignore HSTS on plain HTTP, so local `next start` still works.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000",
        },
      ]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  enablePrerenderSourceMaps: false,
  // Dev-only: HMR must load through Cloudflare quick tunnels.
  // Not applied when NODE_ENV is production (`next build` / `next start`).
  ...(isDev
    ? {
        allowedDevOrigins: ["127.0.0.1", "localhost", "*.trycloudflare.com"],
      }
    : {}),
  images: {
    // The essay does not use next/image. An unset localPatterns allow-list
    // becomes `/**`, so lock it. Next still appends its own static media paths.
    remotePatterns: [],
    localPatterns: [],
    dangerouslyAllowSVG: false,
    dangerouslyAllowLocalIP: false,
    maximumRedirects: 0,
    maximumResponseBody: 1_000_000,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'none'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverSourceMaps: false,
    serverActions: {
      // No Server Actions in this drop. Do not widen the origin check
      // to the dev tunnel. Same-origin remains the only allowed host.
      allowedOrigins: [],
      bodySizeLimit: "32kb",
    },
  },
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
