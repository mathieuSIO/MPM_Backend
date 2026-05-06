import { z } from "zod";

export const registerSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }).optional(),
  lastName: z.string().min(1, { message: "Last name is required" }).optional(),
});

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z.string().min(1, { message: "Password is required" }),
});