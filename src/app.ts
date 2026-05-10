import express from "express";
import cors from "cors";
import path from "path";
import devisRouter from "./routes/devis.router.js";
import orderRouter from "./routes/order.router.js";
import meRouter from "./routes/me.router.js";
import authRouter from "./routes/auth.router.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import productRouter from "./routes/product.router.js";
import uploadRouter from "./routes/upload.router.js";

const uploadsDirectory = path.resolve(process.cwd(), "uploads");

const app = express();
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173", // Allows frontend development server to call the API.
}));

app.use("/api/devis", devisRouter);
app.use("/api/orders", orderRouter);
app.use("/api/me", meRouter);
app.use("/api/auth", authRouter);
app.use("/uploads", express.static(uploadsDirectory));  
app.use("/api/products", productRouter);
app.use("/api/uploads", uploadRouter);

//Check if server life is good
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
    })
})

app.use(errorHandler);

export default app;