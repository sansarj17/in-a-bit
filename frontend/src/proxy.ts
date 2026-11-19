import { NextResponse, type NextRequest } from "next/server";

// Headers the API checks (backend-node/src/middlewares/originLock.ts). Keep the names in sync.
const PROXY_SECRET_HEADER = "x-proxy-secret";
const CLIENT_IP_HEADER = "x-client-ip";

/**
 * Runs on the server before every request is routed. For requests that end up forwarded to
 * the API (/api/* and short codes, via the rewrites in next.config.ts) it adds:
 *
 * - the shared secret, proving the request came through this frontend (the API rejects
 *   anything without it), and
 * - the visitor's IP, which the API uses for rate limiting.
 *
 * On Vercel, `x-real-ip` is set by Vercel from the actual connection, so visitors can't fake
 * it, unlike X-Forwarded-For. Locally it's absent and the API falls back to its own view.
 * Adding the headers to page requests too is harmless: they're never sent to the browser.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);

  // Never pass on values a visitor sent themselves.
  headers.delete(PROXY_SECRET_HEADER);
  headers.delete(CLIENT_IP_HEADER);

  const secret = process.env.PROXY_SECRET;
  if (secret) headers.set(PROXY_SECRET_HEADER, secret);

  const clientIp = request.headers.get("x-real-ip");
  if (clientIp) headers.set(CLIENT_IP_HEADER, clientIp);

  // `request.headers` (not `headers`) here: these go upstream, never back to the browser.
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Everything except static build files and the favicon, which never reach the API.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
