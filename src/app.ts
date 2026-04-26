import express from "express";
import cors from "cors";
import devisRouter from "./routes/devis.router.js";
import { db } from "./db/connection.js";

console.log("DB initialized");
const app = express();
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173", //link to authorise request on backend (here it's locallink)
}));

app.use("/api/devis", devisRouter);


//Check if server life is good
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
    })
})

export default app;