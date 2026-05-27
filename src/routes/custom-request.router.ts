import { Router } from "express";

import { CustomRequestController } from "../controllers/custom-request.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { createCustomRequestSchema } from "../schemas/custom-request.schema.js";

const customRequestRouter = Router();
const customRequestController = new CustomRequestController();

customRequestRouter.post(
    "/",
    validateBody(createCustomRequestSchema),
    asyncHandler(customRequestController.createCustomRequest)
);

export default customRequestRouter;