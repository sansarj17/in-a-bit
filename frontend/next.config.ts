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

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        // Same-origin proxy: the browser talks only to the frontend's domain, so the
        // backend's auth cookie is first-party and no CORS preflight is needed.
        source: "/api/:path*",
        destination: `${getBackendUrl()}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
