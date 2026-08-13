import { RelayReminderService } from "../services/relay-reminder.service.js";

const RELAY_REMINDER_INTERVAL_MS =
    15 * 60 * 1000;

export const startRelayReminderJob = (): (() => void) => {
    const relayReminderService =
        new RelayReminderService();

    let isRunning = false;

    const run = async (): Promise<void> => {
        if (isRunning) {
            console.warn(
                "Relay reminder job skipped: previous execution is still running"
            );
            return;
        }

        isRunning = true;

        try {
            console.log("Relay reminder job started");

            await relayReminderService
                .processPendingRelayReminders();

            console.log("Relay reminder job completed");
        } catch (error) {
            console.error(
                "Relay reminder job failed",
                error
            );
        } finally {
            isRunning = false;
        }
    };

    void run();

    const timer = setInterval(() => {
        void run();
    }, RELAY_REMINDER_INTERVAL_MS);

    timer.unref();

    console.log(
        "Relay reminder job scheduled every 15 minutes"
    );

    return () => {
        clearInterval(timer);
    };
};