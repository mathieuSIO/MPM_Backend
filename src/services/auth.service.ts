import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AuthRepository } from "../repositories/auth.repository.js";
import { env } from "../config/env.js";
import { BadRequestError, UnauthorizedError } from "../errors/http-errors.js";

import type { AuthResponse, AuthUserRow, LoginInput, PublicAuthUser, RegisterInput } from "../types/auth.types.js";

export class AuthService {
    constructor(private readonly authRepository = new AuthRepository()) { }

    async register(input: RegisterInput): Promise<AuthResponse> {
        const existingUser = await this.authRepository.findUserByEmail(input.email);

        if (existingUser) {
            throw new BadRequestError("Email already in use");
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        const user = await this.authRepository.createUser({
            email: input.email,
            passwordHash,
            firstName: input.firstName ?? null,
            lastName: input.lastName ?? null,
        });

        const publicUser = this.toPublicUser(user);

        return {
            user: publicUser,
            token: this.generateToken(publicUser.id, publicUser.role),
        };
    }

    async login(input: LoginInput): Promise<AuthResponse> {
        const user = await this.authRepository.findUserByEmail(input.email);

        if (!user || !user.password_hash) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const isValid = await bcrypt.compare(input.password, user.password_hash);

        if (!isValid) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const publicUser = this.toPublicUser(user);

        return {
            user: publicUser,
            token: this.generateToken(publicUser.id, publicUser.role),
        };
    }

    //#region Private methods

    private toPublicUser(user: AuthUserRow): PublicAuthUser {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            addressLine1: user.address_line1,
            addressLine2: user.address_line2,
            postalCode: user.postal_code,
            city: user.city,
            country: user.country,
        };
    }

    private generateToken(userId: number, role: PublicAuthUser["role"]): string {
        return jwt.sign(
            { userId, role },
            env.jwtSecret,
            { expiresIn: env.jwtExpiresIn }
        );
    }

    //#endregion
}