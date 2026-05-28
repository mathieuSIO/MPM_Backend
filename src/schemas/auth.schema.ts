import { z } from "zod";

export const registerSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
  firstName: z.string().min(1, { message: "First name is required" }).optional(),
  lastName: z.string().min(1, { message: "Last name is required" }).optional(),
  turnstileToken: z.string().min(1, {
    message: "Captcha validation is required",
  }),
});

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z.string().min(1, { message: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, { message: "Invalid reset token" }),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32, {
    message: "Invalid verification token",
  }),
});

export const resendVerificationEmailSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
});