import { prisma } from "../../lib/prisma"
import { AppError } from "../../utils/AppError"
import { isRecordNotFound, isUniqueViolation } from "../../utils/prismaErrors"
import { generateShortCode } from "../../utils/shortCode"
import type { CreateLinkInput, ListLinksQuery, UpdateLinkInput } from "./links.schema"

// A random 7-character code almost never collides; a few retries make it practically certain.
const MAX_CODE_ATTEMPTS = 5

/** The link fields sent to the browser (the owner's id is left out). */
const linkFields = {
    id: true,
    code: true,
    originalUrl: true,
    title: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
} as const

export interface LinkDto {
    id: string
    code: string
    originalUrl: string
    title: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface LinkPage {
    links: LinkDto[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
}

const linkNotFound = () => new AppError(404, "Link not found")

export async function createLink(userId: string, input: CreateLinkInput): Promise<LinkDto> {
    for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
        try {
            return await prisma.link.create({
                data: {
                    code: generateShortCode(),
                    originalUrl: input.originalUrl,
                    title: input.title ?? null,
                    userId,
                },
                select: linkFields,
            })
        } catch (err) {
            // The unique index on `code` caught a collision: try again with a new code.
            if (isUniqueViolation(err)) continue
            throw err
        }
    }
    throw new Error(`Could not generate a unique short code in ${MAX_CODE_ATTEMPTS} attempts`)
}

export async function listLinks(userId: string, { page, limit }: ListLinksQuery): Promise<LinkPage> {
    // One transaction so the page and the total count come from the same snapshot.
    const [links, total] = await prisma.$transaction([
        prisma.link.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: linkFields,
        }),
        prisma.link.count({ where: { userId } }),
    ])

    return { links, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

// Every query below filters by both id and userId, so another user's link is simply
// "not found": a user can't read, change or even detect links that aren't theirs.

export async function getLink(userId: string, linkId: string): Promise<LinkDto> {
    const link = await prisma.link.findFirst({ where: { id: linkId, userId }, select: linkFields })
    if (!link) throw linkNotFound()
    return link
}

export async function updateLink(
    userId: string,
    linkId: string,
    changes: UpdateLinkInput,
): Promise<LinkDto> {
    try {
        return await prisma.link.update({
            where: { id: linkId, userId },
            data: changes,
            select: linkFields,
        })
    } catch (err) {
        if (isRecordNotFound(err)) throw linkNotFound()
        throw err
    }
}

export async function deleteLink(userId: string, linkId: string): Promise<void> {
    try {
        await prisma.link.delete({ where: { id: linkId, userId } })
    } catch (err) {
        if (isRecordNotFound(err)) throw linkNotFound()
        throw err
    }
}
