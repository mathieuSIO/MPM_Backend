import type { NextFunction, Request, Response } from "express";

import { ForbiddenError, UnauthorizedError } from "../errors/http-errors.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId: number;
    role: "user" | "admin";
  };
};

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authenticatedReq = req as AuthenticatedRequest;

  if (!authenticatedReq.user) {
    throw new UnauthorizedError("Authentication required");
  }

  if (authenticatedReq.user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  next();
};