import { Router } from "express";
import { createDevisController } from "../controllers/devisController.js";

const router = Router();

router.post("/", createDevisController );//route pour créer mon devis
// router.get("/:id", );//route pour recuperer un devis specifique

export default router;