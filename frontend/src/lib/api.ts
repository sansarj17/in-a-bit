import wretch from "wretch";
import QueryString from "wretch/addons/queryString";

const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Base client for the in-a-bit API.
 *
 * Calls go to same-origin `/api/*`, which next.config.ts forwards to the Express backend,
 * so the browser sends the auth cookie automatically. Wretch instances are immutable,
 * so this base is safe to share.
 *
 * Browser-only: on the server (getServerSideProps) a relative URL has no host to resolve.
 */
const baseClient = wretch("/api").addon(QueryString);

/** Returns the API client with a fresh timeout for each request. */
export const api = () => baseClient.options({ signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
