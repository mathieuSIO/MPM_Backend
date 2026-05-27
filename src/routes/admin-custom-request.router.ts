import { Router } from "express";

import { CustomRequestController } from "../controllers/custom-request.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAdmin } from "../middleware/require-admin.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { updateCustomRequestStatusSchema } from "../schemas/custom-request.schema.js";

const adminCustomRequestRouter = Router();
const customRequestController = new CustomRequestController();

adminCustomRequestRouter.get(
    "/",
    requireAuth,
    requireAdmin,
    asyncHandler(customRequestController.getAdminCustomRequests)
);

adminCustomRequestRouter.get(
    "/:requestId",
    requireAuth,
    requireAdmin,
    asyncHandler(customRequestController.getAdminCustomRequestDetails)
);

adminCustomRequestRouter.patch(
    "/:requestId/status",
    requireAuth,
    requireAdmin,
    validateBody(updateCustomRequestStatusSchema),
    asyncHandler(customRequestController.updateAdminCustomRequestStatus)
);

export default adminCustomRequestRouter;