import { Router } from "express";

import { DebugMondialRelayController } from "../controllers/debug-mondial-relay.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { requireAdmin } from "../middleware/require-admin.middleware.js";

const router = Router();

const controller =
    new DebugMondialRelayController();

router.get(
    "/test",
    requireAuth,
    requireAdmin,
    asyncHandler(controller.testRelayPoint)
);

export default router;