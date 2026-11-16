import { Router, type Request, type Response } from "express"
import { prisma } from "../../lib/prisma"
import { renderStatusPage } from "./statusPage"

// Generated codes are 7 letters/digits; this also leaves room for custom aliases.
const CODE_PATTERN = /^[A-Za-z0-9_-]{1,32}$/

/** Mounted at the root: GET /:code sends the visitor on to the original URL. */
export const redirectRouter = Router()

redirectRouter.get("/:code", async (req: Request, res: Response) => {
    const code = String(req.params.code)

    const link = CODE_PATTERN.test(code)
        ? await prisma.link.findUnique({
              where: { code },
              select: { originalUrl: true, isActive: true, expiresAt: true },
          })
        : null

    // Never let a browser or CDN cache the answer: if the owner edits or disables the
    // link, the very next visit must see the change.
    res.set("Cache-Control", "no-store")

    if (!link) {
        res.status(404).type("html").send(
            renderStatusPage("Link not found", "This short link doesn't exist. Check it for typos."),
        )
        return
    }

    if (!link.isActive) {
        // 410 Gone: the link existed but has been switched off on purpose.
        res.status(410).type("html").send(
            renderStatusPage("Link disabled", "The owner of this short link has turned it off."),
        )
        return
    }

    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
        res.status(410).type("html").send(
            renderStatusPage("Link expired", "This short link has expired and no longer works."),
        )
        return
    }

    // 302 (temporary), not 301: browsers cache 301s forever, so an edited link
    // would keep sending people to the old address.
    res.redirect(302, link.originalUrl)
})
