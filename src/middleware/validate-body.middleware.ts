import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: result.error.issues,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}