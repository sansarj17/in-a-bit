import { z } from "zod"

const MIN_PASSWORD_LENGTH = 8
// bcrypt only looks at the first 72 bytes of a password, so anything longer would be
// silently cut off. Rejecting it is clearer than accepting characters that don't count.
const MAX_PASSWORD_BYTES = 72
const MAX_NAME_LENGTH = 50
const MAX_EMAIL_LENGTH = 254

const emailField = z
    .string()
    .trim()
    .toLowerCase()
    .max(MAX_EMAIL_LENGTH, "Email is too long")
    .pipe(z.email("Enter a valid email address"))

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`),
    email: emailField,
    password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= MAX_PASSWORD_BYTES,
            "Password is too long",
        ),
})

// Login doesn't re-check password rules: a wrong password just fails the comparison.
export const loginSchema = z.object({
    email: emailField,
    password: z.string().min(1, "Password is required"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
