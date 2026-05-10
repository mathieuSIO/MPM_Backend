import { Router } from "express";

import { UploadController } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { uploadLogoMiddleware } from "../middleware/upload-logo.middleware.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";

const uploadRouter = Router();

const uploadController = new UploadController();

uploadRouter.post(
  "/logos",
  requireAuth,
  uploadLogoMiddleware.single("file"),
  asyncHandler(uploadController.uploadLogo.bind(uploadController))
);

export default uploadRouter;