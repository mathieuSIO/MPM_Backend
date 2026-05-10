import type { Request } from "express";

export type AuthenticatedUser = {
  userId: number;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};