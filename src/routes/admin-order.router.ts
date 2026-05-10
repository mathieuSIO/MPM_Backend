import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { requireAdmin } from "../middleware/require-admin.middleware.js";
import { updateOrderStatusSchema } from "../schemas/admin-order.schema.js";
import { validateBody } from "../middleware/validate-body.middleware.js";

const adminOrderRouter = Router();
const orderController = new OrderController();

adminOrderRouter.get("/", requireAuth, requireAdmin, asyncHandler(orderController.getAdminOrders));
adminOrderRouter.get("/:orderId", requireAuth, requireAdmin, asyncHandler(orderController.getAdminOrderDetails));
adminOrderRouter.patch("/:orderId/status", requireAuth, requireAdmin, validateBody(updateOrderStatusSchema), asyncHandler(orderController.updateAdminOrderStatus));

export default adminOrderRouter;