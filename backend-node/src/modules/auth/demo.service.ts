import bcrypt from "bcryptjs"
import { randomBytes, randomUUID } from "node:crypto"
import { prisma } from "../../lib/prisma"
import { createLink, updateLink } from "../links/links.service"
import { publicUserFields, SALT_ROUNDS, type PublicUser } from "./auth.service"

const DAY_MS = 24 * 60 * 60 * 1000
const SAMPLE_EXPIRY_DAYS = 7

/**
 * "Try the demo": creates a fresh throwaway account with a few sample links.
 * Every visitor gets their own account, so nobody sees or changes anyone else's links.
 */
export async function createDemoUser(): Promise<PublicUser> {
    const user = await prisma.user.create({
        data: {
            name: "Demo visitor",
            // .invalid is a reserved domain (RFC 2606), so this can never be a real inbox.
            email: `demo-${randomUUID()}@demo.invalid`,
            // A random password nobody knows: the account is only reachable via this cookie.
            passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), SALT_ROUNDS),
            isDemo: true,
        },
        select: publicUserFields,
    })

    await createSampleLinks(user.id)
    return user
}

/** One active, one expiring and one disabled link, so every dashboard state is visible. */
async function createSampleLinks(userId: string): Promise<void> {
    await createLink(userId, {
        originalUrl: "https://github.com/sansarj17/in-a-bit",
        title: "in-a-bit source code",
    })
    await createLink(userId, {
        originalUrl: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/302",
        title: "Why short links use 302 redirects",
        expiresAt: new Date(Date.now() + SAMPLE_EXPIRY_DAYS * DAY_MS),
    })
    const disabled = await createLink(userId, {
        originalUrl: "https://expressjs.com/",
        title: "Express docs (disabled example)",
    })
    await updateLink(userId, disabled.id, { isActive: false })
}
