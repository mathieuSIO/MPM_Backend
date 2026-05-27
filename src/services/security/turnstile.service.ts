import { BadRequestError } from "../../errors/http-errors.js";
import { env } from "../../config/env.js";

type TurnstileVerifyResponse = {
    success: boolean;
    "error-codes"?: string[];
};

export class TurnstileService {
    async verify(token: string, remoteIp?: string): Promise<void> {
        if (!env.turnstileSecretKey) {
            throw new BadRequestError("Captcha configuration is missing");
        }

        const body = new URLSearchParams({
            secret: env.turnstileSecretKey,
            response: token,
        });

        if (remoteIp) {
            body.append("remoteip", remoteIp);
        }

        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                body,
            }
        );

        if (!response.ok) {
            throw new BadRequestError("Captcha validation failed");
        }

        const result = (await response.json()) as TurnstileVerifyResponse;

        if (!result.success) {
            console.warn("Turnstile validation failed:", result["error-codes"]);

            throw new BadRequestError("Captcha validation failed");
        }
    }
}