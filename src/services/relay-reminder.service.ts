import { OrderRepository } from "../repositories/order.repository.js";
import { env } from "../config/env.js";
import type { RelayReminderCandidateRow } from "../types/order.repository.types.js";
import { EmailService } from "./email/email.service.js";

const RELAY_REMINDER_DELAY_MS = 2 * 60 * 60 * 1000;

const RELAY_REMINDER_BATCH_SIZE = 50;

export class RelayReminderService {
    constructor(
        private readonly orderRepository: OrderRepository = new OrderRepository(),
        private readonly emailService: EmailService = new EmailService()
    ) { }

    async processPendingRelayReminders(now = new Date()): Promise<void> {
        const paidBefore = new Date(
            now.getTime() - RELAY_REMINDER_DELAY_MS
        );

        const candidates =
            await this.orderRepository.findRelayReminderCandidates(
                paidBefore,
                RELAY_REMINDER_BATCH_SIZE
            );

        for (const candidate of candidates) {
            try {
                await this.processCandidate(
                    candidate.order_id,
                    paidBefore,
                    now
                );
            } catch (error) {
                console.error(
                    `Failed to process relay reminder for order ${candidate.order_id}`,
                    error
                );
            }
        }
    }

    private async processCandidate(orderId: number, paidBefore: Date, now: Date): Promise<void> {
        const candidate = await this.orderRepository.findRelayReminderCandidateByOrderId(
            orderId,
            paidBefore
        );

        if (!candidate) {
            return;
        }

        const relaySelectionUrl =
            this.buildRelaySelectionUrl(candidate);

        const sent = await this.emailService.sendRelayReminderEmail({
            customerEmail: candidate.customer_email,
            customerFirstName:
                candidate.customer_first_name,
            orderId: candidate.order_id,
            relaySelectionUrl,
        });

        if (!sent) {
            return;
        }

        await this.orderRepository.markRelayReminderSent(
            candidate.order_id,
            now
        );
    }

    private buildRelaySelectionUrl(candidate: RelayReminderCandidateRow): string {
        if (candidate.user_id !== null) {
            return new URL(
                `/compte/commandes/${candidate.order_id}/relais`,
                env.frontendOrigin
            ).toString();
        }

        if (!candidate.provider_checkout_session_id) {
            throw new Error(
                `Missing checkout session for guest order ${candidate.order_id}`
            );
        }

        const url = new URL(
            "/checkout/success",
            env.frontendOrigin
        );

        url.searchParams.set(
            "session_id",
            candidate.provider_checkout_session_id
        );

        return url.toString();
    }
}