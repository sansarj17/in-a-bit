import { z } from "zod"
import { env } from "../../config/env"

const MAX_URL_LENGTH = 2048
const MAX_TITLE_LENGTH = 100
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

// Custom aliases share the URL space with the app's own pages, so these can't be used.
const RESERVED_ALIASES = new Set([
    "api", "login", "register", "dashboard", "logout", "signup", "demo",
    "admin", "settings", "about", "help", "404", "500", "_next",
])

const appHostname = new URL(env.appUrl).hostname

/** Hostname of a URL, or null if it isn't a parseable URL. */
function getHostname(url: string): string | null {
    try {
        return new URL(url).hostname
    } catch {
        return null
    }
}

const originalUrlField = z
    .string()
    .trim()
    .max(MAX_URL_LENGTH, "URL is too long")
    // http/https only: blocks javascript:, data: and other schemes that could run code
    // when someone opens the short link. A real domain is required (no localhost or raw IPs).
    .pipe(
        z.url({
            protocol: /^https?$/,
            hostname: z.regexes.domain,
            error: "Enter a full URL starting with http:// or https://",
        }),
    )
    // A short link pointing at another short link could loop forever.
    // (zod still runs this check when the URL check above failed, so it must not throw.)
    .refine((url) => getHostname(url) !== appHostname, "Links to in-a-bit itself aren't allowed")

// Forms send "" for fields left blank; treat that as "not provided".
const blankToUndefined = (value: unknown) =>
    typeof value === "string" && value.trim() === "" ? undefined : value

/** A custom short code chosen by the user, e.g. in-a-bit.app/my-cv. */
const aliasField = z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{3,32}$/, "Use 3 to 32 letters, numbers, - or _")
    .refine((alias) => !RESERVED_ALIASES.has(alias.toLowerCase()), "That alias is reserved")

/** When the link stops working. Must be in the future when it's set. */
const expiresAtField = z.coerce
    .date({ error: "Enter a valid date and time" })
    .refine((date) => date.getTime() > Date.now(), "Pick a time in the future")

// An empty title means "no title", stored as null.
const titleField = z
    .string()
    .trim()
    .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`)
    .transform((title) => (title === "" ? null : title))

export const createLinkSchema = z.object({
    originalUrl: originalUrlField,
    title: titleField.optional(),
    alias: z.preprocess(blankToUndefined, aliasField.optional()),
    expiresAt: z.preprocess(blankToUndefined, expiresAtField.optional()),
})

export const updateLinkSchema = z
    .object({
        originalUrl: originalUrlField.optional(),
        title: titleField.optional(),
        isActive: z.boolean().optional(),
        // null removes the expiry. The code itself can't change: it may already be shared.
        expiresAt: expiresAtField.nullable().optional(),
    })
    .refine((changes) => Object.keys(changes).length > 0, "Nothing to update")

export const listLinksQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
})

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
export type ListLinksQuery = z.infer<typeof listLinksQuerySchema>
