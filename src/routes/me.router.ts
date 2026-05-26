import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { MeController } from "../controllers/me.controller.js";

import { changeMePasswordSchema, updateMeSchema, } from "../schemas/me.schema.js";
import { validateBody } from "../middleware/validate-body.middleware.js";


const meRouter = Router();
const orderController = new OrderController();
const meController = new MeController();

meRouter.get("/", requireAuth, asyncHandler(meController.getMe));
meRouter.patch("/", requireAuth, validateBody(updateMeSchema), asyncHandler(meController.updateMe));
meRouter.patch("/password", requireAuth, validateBody(changeMePasswordSchema), asyncHandler(meController.changePassword));
meRouter.get("/orders", requireAuth, asyncHandler(orderController.getMyOrders));
meRouter.get("/orders/:orderId", requireAuth, asyncHandler(orderController.getMyOrderDetails));

export default meRouter;