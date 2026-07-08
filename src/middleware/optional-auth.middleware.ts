import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { AuthenticatedUser } from "../types/authenticated-request.types.js";

type JwtPayload = {
    role: "admin" | "user";
    userId: number;
};

export const optionalAuth = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        next();
        return;
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        next();
        return;
    }

    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        const user = parseJwtPayload(decoded);

        if (user) {
            req.user = user;
        }
    } catch {
        // Guest checkout must stay frictionless: invalid optional auth is treated as anonymous.
    }

    next();
};

function parseJwtPayload(decoded: string | jwt.JwtPayload): AuthenticatedUser | null {
    if (typeof decoded !== "object" || decoded === null) {
        return null;
    }

    const payload = decoded as Partial<JwtPayload>;

    if (
        typeof payload.userId !== "number" ||
        (payload.role !== "user" && payload.role !== "admin")
    ) {
        return null;
    }

    return {
        role: payload.role,
        userId: payload.userId,
    };
}
