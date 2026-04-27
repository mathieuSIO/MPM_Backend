import "dotenv/config";

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./db/connection.js";


const startServer = async () => {

    await connectDB();

    app.listen(env.port, () => {
        console.log(`serveur is running on port ${env.port}`)
    })
}

startServer();


