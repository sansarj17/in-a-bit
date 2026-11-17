import bcrypt from "bcryptjs"
import { prisma } from "../../lib/prisma"
import { AppError } from "../../utils/AppError"
import { isUniqueViolation } from "../../utils/prismaErrors"
import type { LoginInput, RegisterInput } from "./auth.schema"

export const SALT_ROUNDS = 10

// Used when the email doesn't exist, so that case runs bcrypt too and takes as long as a
// wrong password. Otherwise response times would reveal which emails have accounts.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS)

/** The user fields that are safe to send to the browser (never the password hash). */
export const publicUserFields = {
    id: true,
    email: true,
    name: true,
    isDemo: true,
    createdAt: true,
} as const

export interface PublicUser {
    id: string
    email: string
    name: string
    isDemo: boolean
    createdAt: Date
}

export async function register(input: RegisterInput): Promise<PublicUser> {
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

    try {
        return await prisma.user.create({
            data: { name: input.name, email: input.email, passwordHash },
            select: publicUserFields,
        })
    } catch (err) {
        // The unique index on email is the real guard: a "check first, then insert" could
        // still race when two sign-ups for the same email arrive at once.
        if (isUniqueViolation(err)) {
            throw new AppError(409, "An account with this email already exists")
        }
        throw err
    }
}

export async function login(input: LoginInput): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { email: input.email } })
    const isPasswordCorrect = await bcrypt.compare(
        input.password,
        user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    )

    // Same message for both cases, so the response doesn't reveal whether the email exists.
    if (!user || !isPasswordCorrect) {
        throw new AppError(401, "Invalid email or password")
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        isDemo: user.isDemo,
        createdAt: user.createdAt,
    }
}

export async function getUserById(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserFields })

    // The token was valid but the account is gone (e.g. deleted): treat as logged out.
    if (!user) {
        throw new AppError(401, "Please log in to continue")
    }

    return user
}
