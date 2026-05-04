import type { Request, Response, NextFunction } from "express";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global error:", err);

  if (err instanceof Error) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};