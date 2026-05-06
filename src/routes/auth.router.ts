import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { validateBody } from "../middleware/validate-body.middleware.js";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(authController.login));

export default authRouter;