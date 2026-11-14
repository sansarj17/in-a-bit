import { Prisma } from "../generated/prisma/client"

// Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
const UNIQUE_CONSTRAINT_VIOLATION = "P2002"
const RECORD_NOT_FOUND = "P2025"

function hasPrismaCode(err: unknown, code: string): boolean {
    return err instanceof Prisma.PrismaClientKnownRequestError && err.code === code
}

/** A unique index rejected the write (e.g. the email or short code is already taken). */
export function isUniqueViolation(err: unknown): boolean {
    return hasPrismaCode(err, UNIQUE_CONSTRAINT_VIOLATION)
}

/** An update/delete matched no row (e.g. the link doesn't exist or belongs to someone else). */
export function isRecordNotFound(err: unknown): boolean {
    return hasPrismaCode(err, RECORD_NOT_FOUND)
}
