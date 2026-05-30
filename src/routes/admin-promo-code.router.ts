import { Router } from "express";

import { PromoCodeController } from "../controllers/promo-code.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { requireAdmin } from "../middleware/require-admin.middleware.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { createPromoCodeSchema, updatePromoCodeStatusSchema } from "../schemas/promo-code.schema.js";

const adminPromoCodeRouter = Router();
const promoCodeController = new PromoCodeController();

adminPromoCodeRouter.get(
    "/",
    requireAuth,
    requireAdmin,
    asyncHandler(promoCodeController.getAdminPromoCodes)
);

adminPromoCodeRouter.post(
    "/",
    requireAuth,
    requireAdmin,
    validateBody(createPromoCodeSchema),
    asyncHandler(promoCodeController.createAdminPromoCode)
);

adminPromoCodeRouter.patch(
    "/:promoCodeId/status",
    requireAuth,
    requireAdmin,
    validateBody(updatePromoCodeStatusSchema),
    asyncHandler(
        promoCodeController.updateAdminPromoCodeStatus
    )
);

export default adminPromoCodeRouter;