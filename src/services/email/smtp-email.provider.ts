import nodemailer from "nodemailer";

import { emailConfig } from "../../config/email.js";

import type { SendEmailInput } from "../../types/email.types.js";

import type { EmailProvider } from "./email-provider.interface.js";

export class SmtpEmailProvider implements EmailProvider {
    private readonly transporter = nodemailer.createTransport({
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        secure: emailConfig.smtp.secure,
        requireTLS: true,

        auth: {
            user: emailConfig.smtp.user,
            pass: emailConfig.smtp.password,
        },
    });

    async sendEmail(input: SendEmailInput): Promise<void> {
        if (!emailConfig.from.address) {
            throw new Error("EMAIL_FROM_ADDRESS is missing");
        }

        await this.transporter.sendMail({
            from: {
                name: emailConfig.from.name,
                address: emailConfig.from.address,
            },

            to: input.to,

            subject: input.subject,

            html: input.html,

            text: input.text,
        });
    }
}