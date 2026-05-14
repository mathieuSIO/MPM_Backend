export const emailConfig = {
    enabled: process.env.EMAIL_ENABLED === "true",

    smtp: {
        host: process.env.SMTP_HOST ?? "mail.infomaniak.com",
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
    },

    from: {
        name: process.env.EMAIL_FROM_NAME ?? "Mon Petit Matos",
        address: process.env.EMAIL_FROM_ADDRESS,
    },

    adminOrderEmail: process.env.ADMIN_ORDER_EMAIL,
};