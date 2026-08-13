export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type CustomRequestEmailInput = {
  customerEmail: string;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerPhone: string | null;
  message: string;
};

export type EmailVerificationEmailInput = {
  email: string;
  firstName: string | null;
  verificationUrl: string;
};

export type RelayReminderEmailInput = {
    customerEmail: string;
    customerFirstName: string | null;
    orderId: number;
    relaySelectionUrl: string;
};