import express from "express";
import cors from "cors";
import path from "path";
import devisRouter from "./routes/devis.router.js";
import orderRouter from "./routes/order.router.js";
import meRouter from "./routes/me.router.js";
import authRouter from "./routes/auth.router.js";
import productRouter from "./routes/product.router.js";
import uploadRouter from "./routes/upload.router.js";
import adminOrderRouter from "./routes/admin-order.router.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import paymentRouter from "./routes/payment.router.js";
import paymentWebhookRouter from "./routes/payment-webhook.router.js";
import adminCustomRequestRouter from "./routes/admin-custom-request.router.js";
import customRequestRouter from "./routes/custom-request.router.js";
import adminPromoCodeRouter from "./routes/admin-promo-code.router.js";
import promoCodeRouter from "./routes/promo-code.router.js";

const uploadsDirectory = path.resolve(process.cwd(), "uploads");

const app = express();
app.use("/api/payments/webhook", paymentWebhookRouter);

app.use(express.json());

app.use(cors({
    origin: env.frontendOrigin, // Allows frontend development server to call the API.
}));

app.use("/api/devis", devisRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/me", meRouter);
app.use("/api/auth", authRouter);
app.use("/uploads", express.static(uploadsDirectory));
app.use("/api/products", productRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/custom-requests", customRequestRouter);
app.use("/api/admin/custom-requests", adminCustomRequestRouter);
app.use("/api/promo-codes", promoCodeRouter);
app.use("/api/admin/promo-codes", adminPromoCodeRouter);

//Check if server life is good
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
    })
})

app.use(errorHandler);

export default app;