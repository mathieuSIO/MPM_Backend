import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { UnauthorizedError } from "../errors/http-errors.js";

type JwtPayload = {
    userId: number;
    role: "user" | "admin";
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new UnauthorizedError("Missing authorization header");
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        throw new UnauthorizedError("Invalid authorization format");
    }

    try {
        const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

        // on injecte l'utilisateur dans la requête
        (req as Request & { user: JwtPayload }).user = decoded;

        next();
    } catch {
        throw new UnauthorizedError("Invalid or expired token");
    }
};