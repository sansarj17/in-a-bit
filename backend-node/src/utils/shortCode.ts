import { randomInt } from "node:crypto"

// Letters and digits only (base62), so codes are URL-safe and easy to read out.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

// 62^7 ≈ 3.5 trillion possible codes: collisions are rare, and guessing a valid one is hopeless.
export const SHORT_CODE_LENGTH = 7

/**
 * Random short code like "x7Kp2Qa". Uses crypto.randomInt rather than Math.random,
 * so codes can't be predicted from earlier ones.
 */
export function generateShortCode(): string {
    let code = ""
    for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
        code += ALPHABET[randomInt(ALPHABET.length)]
    }
    return code
}
