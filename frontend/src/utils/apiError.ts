import wretch from "wretch";
import type { IApiError } from "@/interfaces";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

function isApiError(value: unknown): value is IApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

/**
 * wretch throws a WretchError for non-2xx responses, with the response body as `message`.
 * This reads our `{ success: false, message, details }` body out of it, if it is one.
 */
function parseApiError(error: unknown): IApiError | null {
  if (!(error instanceof wretch.WretchError)) return null;

  try {
    const body: unknown = JSON.parse(error.message);
    return isApiError(body) ? body : null;
  } catch {
    return null; // not JSON, e.g. an HTML error page from a proxy
  }
}

/** A message that is safe to show the user, for any error a request can throw. */
export function getErrorMessage(error: unknown): string {
  const apiError = parseApiError(error);
  if (apiError) return apiError.message;

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "The server took too long to respond. Please try again.";
  }
  if (error instanceof TypeError) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return FALLBACK_MESSAGE;
}

/** The first validation message per field, e.g. { email: "Enter a valid email address" }. */
export function getFieldErrors(error: unknown): Record<string, string | undefined> {
  const details = parseApiError(error)?.details ?? {};
  return Object.fromEntries(
    Object.entries(details).map(([field, messages]) => [field, messages?.[0]]),
  );
}
