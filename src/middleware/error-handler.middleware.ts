import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};