import type { Request } from "express";

export type AuthenticatedUser = {
  role: "admin" | "user";
  userId: number;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
