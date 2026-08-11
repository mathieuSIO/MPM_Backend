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
meRouter.use(requireAuth);

meRouter.get("/", asyncHandler(meController.getMe));
meRouter.patch("/", validateBody(updateMeSchema), asyncHandler(meController.updateMe));
meRouter.patch("/password", validateBody(changeMePasswordSchema), asyncHandler(meController.changePassword));
meRouter.get("/orders", asyncHandler(orderController.getMyOrders));
meRouter.get("/orders/:orderId", asyncHandler(orderController.getMyOrderDetails));
meRouter.get("/orders/:orderId/relay-selection", asyncHandler(meController.getRelaySelectionForOrder));
meRouter.patch("/orders/:orderId/relay-point", asyncHandler(meController.selectRelayPointForOrder));

export default meRouter;