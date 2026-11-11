import type { Request, Response } from "express"
import { clearAuthCookie, setAuthCookie } from "./auth.cookie"
import type { LoginInput, RegisterInput } from "./auth.schema"
import * as authService from "./auth.service"

// Bodies have already been checked by validateBody, so they match the schema types here.

export async function register(req: Request, res: Response): Promise<void> {
    const user = await authService.register(req.body as RegisterInput)
    setAuthCookie(res, user.id) // signing up also logs you in
    res.status(201).json({ success: true, data: { user } })
}

export async function login(req: Request, res: Response): Promise<void> {
    const user = await authService.login(req.body as LoginInput)
    setAuthCookie(res, user.id)
    res.json({ success: true, data: { user } })
}

export function logout(_req: Request, res: Response): void {
    clearAuthCookie(res)
    res.json({ success: true, data: null })
}

export async function me(req: Request, res: Response): Promise<void> {
    // requireAuth runs before this handler, so userId is always set here.
    const user = await authService.getUserById(req.userId!)
    res.json({ success: true, data: { user } })
}
