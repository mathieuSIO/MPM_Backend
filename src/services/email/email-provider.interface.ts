import type { SendEmailInput } from "../../types/email.types.js";

export interface EmailProvider {
    sendEmail(input: SendEmailInput): Promise<void>;
}