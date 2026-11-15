/** Full short URL, e.g. "https://in-a-bit.app/x7Kp2Qa". Browser-only (uses the current origin). */
export function getShortUrl(code: string): string {
  return `${window.location.origin}/${code}`;
}

/** The short URL without "https://", for display. */
export function getDisplayShortUrl(code: string): string {
  return `${window.location.host}/${code}`;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

/** "Nov 14, 2026" style date in the visitor's locale. */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}
