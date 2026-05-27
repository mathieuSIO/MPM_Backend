export type CustomRequestStatus = "new" | "in_progress" | "quoted" | "closed";

export type CreateCustomRequestInput = {
    userId?: number | null;
    customerEmail: string;
    customerFirstName?: string | null;
    customerLastName?: string | null;
    customerPhone?: string | null;
    message: string;
};

export type CustomRequestRow = {
    id: number;
    user_id: number | null;
    customer_email: string;
    customer_first_name: string | null;
    customer_last_name: string | null;
    customer_phone: string | null;
    message: string;
    status: CustomRequestStatus;
    created_at: Date;
    updated_at: Date;
};

export type PublicCustomRequest = {
    id: number;
    userId: number | null;
    customerEmail: string;
    customerFirstName: string | null;
    customerLastName: string | null;
    customerPhone: string | null;
    message: string;
    status: CustomRequestStatus;
    createdAt: Date;
    updatedAt: Date;
};