import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { forgotPasswordSchema, loginSchema, registerSchema, resendVerificationEmailSchema, resetPasswordSchema } from "../schemas/auth.schema.js";
import { validateBody } from "../middleware/validate-body.middleware.js";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
authRouter.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(authController.resetPassword));
authRouter.post("/resend-verification-email", validateBody(resendVerificationEmailSchema), asyncHandler(authController.resendVerificationEmail));
authRouter.get("/verify-email", asyncHandler(authController.verifyEmail));

export default authRouter;