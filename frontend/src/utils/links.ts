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

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

/** "Nov 14, 2026, 9:30 PM" style date and time in the visitor's locale. */
export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}

export function isExpired(link: { expiresAt: string | null }): boolean {
  return link.expiresAt !== null && new Date(link.expiresAt).getTime() <= Date.now();
}

/**
 * <input type="datetime-local"> works in local time without a timezone ("2026-11-20T18:30").
 * These convert between that and the ISO/UTC strings the API uses.
 */
export function toDateTimeLocalValue(isoDate: string | null): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Local datetime-local value → ISO string, or null when the field is empty. */
export function fromDateTimeLocalValue(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
