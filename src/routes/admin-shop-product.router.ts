import { Router } from "express";

import { ShopProductController } from "../controllers/shop-product.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAdmin } from "../middleware/require-admin.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import {
    createShopProductSchema,
    createShopProductVariantSchema,
    updateShopProductSchema,
    updateShopProductStatusSchema,
    updateShopProductVariantSchema,
    updateShopProductVariantStatusSchema,
} from "../schemas/shop-product.schema.js";
import { uploadShopProductImageMiddleware } from "../middleware/upload-shop-product-image.middleware.js";

const router = Router();
const controller = new ShopProductController();

router.get("/", requireAuth, requireAdmin, asyncHandler(controller.getAdminProducts));
router.post("/", requireAuth, requireAdmin, validateBody(createShopProductSchema), asyncHandler(controller.createAdminProduct));
router.post("/image", requireAuth, requireAdmin, uploadShopProductImageMiddleware.single("file"), asyncHandler(controller.uploadAdminProductImage));
router.patch("/:productId", requireAuth, requireAdmin, validateBody(updateShopProductSchema), asyncHandler(controller.updateAdminProduct));
router.patch("/:productId/status", requireAuth, requireAdmin, validateBody(updateShopProductStatusSchema), asyncHandler(controller.updateAdminProductStatus));
router.get("/:productId/variants", requireAuth, requireAdmin, asyncHandler(controller.getAdminProductVariants));
router.post("/:productId/variants", requireAuth, requireAdmin, validateBody(createShopProductVariantSchema), asyncHandler(controller.createAdminProductVariant));
router.patch("/:productId/variants/:variantId", requireAuth, requireAdmin, validateBody(updateShopProductVariantSchema), asyncHandler(controller.updateAdminProductVariant));
router.patch("/:productId/variants/:variantId/status", requireAuth, requireAdmin, validateBody(updateShopProductVariantStatusSchema), asyncHandler(controller.updateAdminProductVariantStatus));

export default router;