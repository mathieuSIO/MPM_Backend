export type MeUserRow = {
    id: number;
    email: string;
    role: "user" | "admin";
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address_line1: string | null;
    address_line2: string | null;
    postal_code: string | null;
    city: string | null;
    country: string | null;
    created_at: Date;
    updated_at: Date;
};

export type PublicMeUser = {
    id: number;
    email: string;
    role: "user" | "admin";
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    postalCode: string | null;
    city: string | null;
    country: string | null;
};

export type UpdateMeInput = {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
};

export type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
};