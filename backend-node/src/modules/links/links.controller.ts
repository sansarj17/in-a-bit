import type { Request, Response } from "express"
import { z } from "zod"
import { parseInput } from "../../middlewares/validate"
import { AppError } from "../../utils/AppError"
import { listLinksQuerySchema, type CreateLinkInput, type UpdateLinkInput } from "./links.schema"
import * as linksService from "./links.service"

// All routes here run after requireAuth, so req.userId is always set.

/** Link ids are UUIDs; anything else can't match a link, so it's a 404 rather than a DB error. */
function parseLinkId(req: Request): string {
    const result = z.uuid().safeParse(req.params.id)
    if (!result.success) throw new AppError(404, "Link not found")
    return result.data
}

export async function create(req: Request, res: Response): Promise<void> {
    const link = await linksService.createLink(req.userId!, req.body as CreateLinkInput)
    res.status(201).json({ success: true, data: { link } })
}

export async function list(req: Request, res: Response): Promise<void> {
    const query = parseInput(listLinksQuerySchema, req.query)
    const page = await linksService.listLinks(req.userId!, query)
    res.json({ success: true, data: page })
}

export async function getOne(req: Request, res: Response): Promise<void> {
    const link = await linksService.getLink(req.userId!, parseLinkId(req))
    res.json({ success: true, data: { link } })
}

export async function update(req: Request, res: Response): Promise<void> {
    const link = await linksService.updateLink(
        req.userId!,
        parseLinkId(req),
        req.body as UpdateLinkInput,
    )
    res.json({ success: true, data: { link } })
}

export async function remove(req: Request, res: Response): Promise<void> {
    await linksService.deleteLink(req.userId!, parseLinkId(req))
    res.json({ success: true, data: null })
}
