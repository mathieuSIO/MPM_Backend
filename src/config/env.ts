import type { SignOptions } from "jsonwebtoken";

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: requiredEnv("DATABASE_URL"),

  jwtSecret: requiredEnv("JWT_SECRET"),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as JwtExpiresIn,

  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
};