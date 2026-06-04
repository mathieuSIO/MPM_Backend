import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { ShopProductController } from "../controllers/shop-product.controller.js";

const router = Router();
const controller = new ShopProductController();

router.get("/", asyncHandler(controller.getProducts));
router.get("/:slug", asyncHandler(controller.getProduct));

export default router;