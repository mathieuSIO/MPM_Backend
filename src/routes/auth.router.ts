import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));

export default authRouter;