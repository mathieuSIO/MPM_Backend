import { emailConfig } from "../../config/email.js";
import type { CustomRequestEmailInput, EmailVerificationEmailInput, RelayReminderEmailInput } from "../../types/email.types.js";

import type { EmailProvider } from "./email-provider.interface.js";

import { SmtpEmailProvider } from "./smtp-email.provider.js";

type OrderPaidEmailInput = {
    customerEmail: string;
    customerFirstName: string | null;
    orderId: number;
    totalPriceCents: number;
};

type AccountCreatedEmailInput = {
    email: string;
    firstName: string | null;
};

export class EmailService {
    constructor(
        private readonly emailProvider: EmailProvider =
            new SmtpEmailProvider()
    ) { }

    async sendAccountCreatedEmail(
        input: AccountCreatedEmailInput
    ): Promise<void> {
        if (!emailConfig.enabled) {
            return;
        }

        await this.emailProvider.sendEmail({
            to: input.email,

            subject: "Bienvenue sur Mon Petit Matos",

            html: `
            <h1>Bienvenue sur Mon Petit Matos</h1>

            <p>
                Bonjour${input.firstName ? ` ${input.firstName}` : ""},
            </p>

            <p>
                Votre compte a bien été créé.
            </p>

            <p>
                Vous pouvez maintenant vous connecter à votre espace client,
                suivre vos commandes et retrouver vos informations.
            </p>

            <p>
                Merci pour votre confiance.
            </p>

            <p>
                Mon Petit Matos
            </p>
        `,

            text:
                "Bienvenue sur Mon Petit Matos. " +
                "Votre compte a bien été créé. " +
                "Vous pouvez maintenant vous connecter à votre espace client.",
        });
    }

    async sendOrderPaidCustomerEmail(
        input: OrderPaidEmailInput
    ): Promise<void> {
        if (!emailConfig.enabled) {
            return;
        }

        const total = this.formatPrice(input.totalPriceCents);

        await this.emailProvider.sendEmail({
            to: input.customerEmail,

            subject: "Votre commande Mon Petit Matos est confirmée",

            html: `
                <h1>Commande confirmée</h1>

                <p>
                    Bonjour${input.customerFirstName
                    ? ` ${input.customerFirstName}`
                    : ""
                },
                </p>

                <p>
                    Nous avons bien reçu votre paiement.
                </p>

                <p>
                    Votre commande #${input.orderId} est maintenant confirmée.
                </p>

                <p>
                    <strong>Total payé :</strong> ${total}
                </p>

                <p>
                    Nous allons préparer votre commande et revenir vers vous
                    si nécessaire pour la validation des visuels.
                </p>

                <p>
                    Merci pour votre confiance.
                </p>

                <p>
                    Mon Petit Matos
                </p>
            `,

            text:
                `Votre commande #${input.orderId} est confirmée. ` +
                `Total payé : ${total}.`,
        });
    }

    async sendNewPaidOrderAdminEmail(
        input: OrderPaidEmailInput
    ): Promise<void> {
        console.log("sendNewPaidOrderAdminEmail called");

        if (!emailConfig.enabled) {
            console.log("Admin email skipped: EMAIL_ENABLED is false");
            return;
        }

        const adminEmail =
            emailConfig.adminOrderEmail ?? emailConfig.from.address;

        console.log("adminEmail:", adminEmail);

        if (!adminEmail) {
            console.log("Admin email skipped: no admin email configured");
            return;
        }

        const total = this.formatPrice(input.totalPriceCents);

        await this.emailProvider.sendEmail({
            to: adminEmail,
            subject: `Nouvelle commande payée #${input.orderId}`,
            html: `
            <h1>Nouvelle commande payée</h1>
            <p>Une nouvelle commande vient d’être payée sur le site.</p>
            <ul>
                <li><strong>Commande :</strong> #${input.orderId}</li>
                <li><strong>Client :</strong> ${input.customerEmail}</li>
                <li><strong>Total :</strong> ${total}</li>
            </ul>
        `,
            text:
                `Nouvelle commande payée #${input.orderId}. ` +
                `Client : ${input.customerEmail}. ` +
                `Total : ${total}.`,
        });

        console.log("Admin order email sent");
    }

    async sendPasswordResetEmail(input: {
        email: string;
        firstName: string | null;
        resetUrl: string;
    }): Promise<void> {
        await this.emailProvider.sendEmail({
            to: input.email,
            subject: "Réinitialisation de votre mot de passe",
            html: `
      <p>Bonjour${input.firstName ? ` ${input.firstName}` : ""},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>
        <a href="${input.resetUrl}">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
    `,
        });
    }

    async sendCustomRequestAdminEmail(input: CustomRequestEmailInput): Promise<void> {
        if (!emailConfig.enabled) {
            return;
        }

        const adminEmail =
            emailConfig.adminOrderEmail ?? emailConfig.from.address;

        if (!adminEmail) {
            return;
        }

        await this.emailProvider.sendEmail({
            to: adminEmail,

            subject: "Nouvelle demande personnalisée",

            html: `
            <h1>Nouvelle demande personnalisée</h1>

            <p>
                <strong>Email :</strong>
                ${input.customerEmail}
            </p>

            <p>
                <strong>Prénom :</strong>
                ${input.customerFirstName ?? "-"}
            </p>

            <p>
                <strong>Nom :</strong>
                ${input.customerLastName ?? "-"}
            </p>

            <p>
                <strong>Téléphone :</strong>
                ${input.customerPhone ?? "-"}
            </p>

            <hr />

            <p>
                <strong>Demande :</strong>
            </p>

            <p>
                ${input.message.replace(/\n/g, "<br />")}
            </p>
        `,

            text:
                `Nouvelle demande personnalisée\n\n` +
                `Email : ${input.customerEmail}\n` +
                `Prénom : ${input.customerFirstName ?? "-"}\n` +
                `Nom : ${input.customerLastName ?? "-"}\n` +
                `Téléphone : ${input.customerPhone ?? "-"}\n\n` +
                `Message :\n${input.message}`,
        });
    }

    async sendEmailVerificationEmail(input: EmailVerificationEmailInput): Promise<void> {
        if (!emailConfig.enabled) {
            return;
        }

        await this.emailProvider.sendEmail({
            to: input.email,
            subject: "Confirmez votre adresse email",
            html: `
            <h1>Confirmez votre adresse email</h1>

            <p>Bonjour${input.firstName ? ` ${input.firstName}` : ""},</p>

            <p>
                Merci d’avoir créé un compte sur Mon Petit Matos.
                Pour confirmer votre adresse email, cliquez sur le lien ci-dessous :
            </p>

            <p>
                <a href="${input.verificationUrl}">
                    Confirmer mon adresse email
                </a>
            </p>

            <p>Ce lien expire dans 24 heures.</p>

            <p>
                Si vous n'êtes pas à l'origine de cette création de compte,
                vous pouvez ignorer cet email.
            </p>
        `,
            text:
                `Confirmez votre adresse email\n\n` +
                `Bonjour${input.firstName ? ` ${input.firstName}` : ""},\n\n` +
                `Merci d’avoir créé un compte sur Mon Petit Matos.\n` +
                `Confirmez votre adresse email avec ce lien :\n` +
                `${input.verificationUrl}\n\n` +
                `Ce lien expire dans 24 heures.\n`,
        });
    }

    async sendRelayReminderEmail(input: RelayReminderEmailInput): Promise<boolean> {
        if (!emailConfig.enabled) {
            return false;
        }

        await this.emailProvider.sendEmail({
            to: input.customerEmail,

            subject: "Choisissez votre Point Relais pour votre commande",

            html: `
            <h1>Votre commande attend votre Point Relais</h1>

            <p>
                Bonjour${input.customerFirstName
                    ? ` ${input.customerFirstName}`
                    : ""
                },
            </p>

            <p>
                Votre commande #${input.orderId} a bien été enregistrée.
            </p>

            <p>
                Il ne vous reste plus qu'à sélectionner votre Point Relais
                Mondial Relay afin que nous puissions préparer son expédition.
            </p>

            <p>
                <a href="${input.relaySelectionUrl}">
                    Choisir mon Point Relais
                </a>
            </p>

            <p>
                Si vous avez déjà sélectionné votre Point Relais entre-temps,
                vous pouvez ignorer cet email.
            </p>

            <p>
                Merci pour votre confiance.
            </p>

            <p>
                Mon Petit Matos
            </p>
        `,

            text:
                `Bonjour${input.customerFirstName
                    ? ` ${input.customerFirstName}`
                    : ""
                },\n\n` +
                `Votre commande #${input.orderId} attend encore la sélection de votre Point Relais Mondial Relay.\n\n` +
                `Choisissez votre Point Relais ici :\n` +
                `${input.relaySelectionUrl}\n\n` +
                `Si vous l'avez déjà sélectionné entre-temps, vous pouvez ignorer cet email.\n\n` +
                `Mon Petit Matos`,
        });

        return true;
    }

    private formatPrice(amountCents: number): string {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
        }).format(amountCents / 100);
    }
}