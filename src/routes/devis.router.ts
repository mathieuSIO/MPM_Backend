import { Router } from "express";
import { createDevisController } from "../controllers/devis.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";

const router = Router();

router.post("/", asyncHandler(createDevisController) );//route pour créer mon devis

export default router;