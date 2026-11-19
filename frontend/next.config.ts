import type { NextConfig } from "next";

const DEV_BACKEND_URL = "http://localhost:8080";

/**
 * Where the Express API lives. Server-side only (no NEXT_PUBLIC_ prefix): the browser
 * never sees it, because it always calls same-origin `/api/*` and Next forwards it.
 */
function getBackendUrl(): string {
  const url = process.env.BACKEND_URL;

  if (url) {
    return url.replace(/\/+$/, "");
  }

  // `next build` runs with NODE_ENV=production. Fail the build rather than ship a site
  // whose API calls silently go to localhost.
  if (process.env.NODE_ENV === "production") {
    throw new Error("BACKEND_URL must be set for production builds (e.g. in Vercel env vars).");
  }

  return DEV_BACKEND_URL;
}

/**
 * src/proxy.ts sends PROXY_SECRET to the API with every forwarded request, and the API
 * rejects requests without it. Fail a production build that lacks it, rather than ship a
 * site whose every API call is refused.
 */
function assertProxySecret(): void {
  if (process.env.NODE_ENV === "production" && !process.env.PROXY_SECRET) {
    throw new Error("PROXY_SECRET must be set for production builds (same value as the API's).");
  }
}

assertProxySecret();

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy: the browser only loads scripts, styles, fonts and API calls
 * from our own origin, so even if someone injected HTML, it couldn't run outside code.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    // Production only: the dev server's hot reloading relies on eval and on files these
    // headers would block. `next build && next start` is how to check them locally.
    return isDev ? [] : [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },

  async rewrites() {
    const backendUrl = getBackendUrl();

    return {
      afterFiles: [
        {
          // Same-origin proxy: the browser talks only to the frontend's domain, so the
          // backend's auth cookie is first-party and no CORS preflight is needed.
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
      fallback: [
        {
          // Short links live on the frontend's domain (e.g. in-a-bit.app/x7Kp2Qa).
          // `fallback` only runs after every page and static file has been checked, so
          // /login, /dashboard, ... still work; anything else goes to the backend, which
          // answers with the 302 redirect (or a "not found" page).
          source: "/:code",
          destination: `${backendUrl}/:code`,
        },
      ],
    };
  },
};

export default nextConfig;
