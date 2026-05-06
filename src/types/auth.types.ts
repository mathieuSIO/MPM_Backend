export type AuthUserRow = {
    id: number;
    email: string;
    password_hash: string | null;

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

export type PublicAuthUser = {
    id: number;
    email: string;

    firstName: string | null;
    lastName: string | null;
    phone: string | null;

    addressLine1: string | null;
    addressLine2: string | null;
    postalCode: string | null;
    city: string | null;
    country: string | null;
};

export type CreateAuthUserInput = {
    email: string;
    passwordHash: string;

    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;

    addressLine1?: string | null;
    addressLine2?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
};

export type AuthResponse = {
    user: PublicAuthUser;
    token: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};