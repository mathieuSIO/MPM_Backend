import "dotenv/config";

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./db/connection.js";

const startServer = async () => {

    try {
        await connectDB();
        app.listen(env.port, () => {
            console.log(`serveur is running on port ${env.port}`)
        })
    } catch (error) {
        console.error("Failed to start server : ", error);
        process.exit(1);
    }
}

startServer();