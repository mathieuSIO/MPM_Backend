import "dotenv/config";

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./db/connection.js";
import { startRelayReminderJob } from "./jobs/relay-reminder.job.js";

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        const server = app.listen(env.port, () => {
            console.log(`Server is running on port ${env.port}`);
        });

        const stopRelayReminderJob = env.relayReminderJobEnabled ? startRelayReminderJob() : null;

        let isShuttingDown = false;

        const shutdown = (): void => {
            if (isShuttingDown) {
                return;
            }

            isShuttingDown = true;

            console.log("Shutting down server...");

            stopRelayReminderJob?.();

            server.close(() => {
                console.log("HTTP server stopped");
                process.exit(0);
            });
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

void startServer();