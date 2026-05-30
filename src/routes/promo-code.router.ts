import { Router } from "express";

import { PromoCodeController } from "../controllers/promo-code.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { validatePromoCodeSchema } from "../schemas/promo-code.schema.js";

const promoCodeRouter = Router();
const promoCodeController = new PromoCodeController();

promoCodeRouter.post(
    "/validate",
    validateBody(validatePromoCodeSchema),
    asyncHandler(promoCodeController.validatePromoCode)
);

export default promoCodeRouter;