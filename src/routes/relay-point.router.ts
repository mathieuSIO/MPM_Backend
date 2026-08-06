import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { selectRelayPointSchema } from "../schemas/relay-point.schema.js";
import { RelayPointController } from "../controllers/relay-point.controller.js";
import { rateLimit } from 'express-rate-limit';

const router = Router();

const controller = new RelayPointController();

export const relayPointRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
});

router.patch(
    "/relay-point",
    relayPointRateLimiter,
    validateBody(selectRelayPointSchema),
    asyncHandler(controller.selectRelayPoint)
);

export default router;