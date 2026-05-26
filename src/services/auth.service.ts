import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { AuthRepository } from "../repositories/auth.repository.js";
import { env } from "../config/env.js";
import { BadRequestError, UnauthorizedError } from "../errors/http-errors.js";

import type { AuthResponse, AuthUserRow, ForgotPasswordInput, LoginInput, PublicAuthUser, RegisterInput, ResetPasswordInput } from "../types/auth.types.js";
import { EmailService } from "./email/email.service.js";

export class AuthService {
    constructor(
        private readonly authRepository = new AuthRepository(),
        private readonly emailService = new EmailService()
    ) { }

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

        try {
            await this.emailService.sendAccountCreatedEmail({
                email: user.email,
                firstName: user.first_name,
            });
        } catch (error) {
            console.error(
                "Failed to send account created email:",
                error
            );
        }

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

    async forgotPassword(input: ForgotPasswordInput): Promise<void> {
        const user = await this.authRepository.findUserByEmail(input.email);

        if (!user) {
            return;
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = this.hashPasswordResetToken(resetToken);

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await this.authRepository.savePasswordResetToken({
            userId: user.id,
            tokenHash,
            expiresAt,
        });

        const resetUrl = `${env.frontendOrigin}/reset-password?token=${resetToken}`;

        try {
            await this.emailService.sendPasswordResetEmail({
                email: user.email,
                firstName: user.first_name,
                resetUrl,
            });
        } catch (error) {
            console.error("Failed to send password reset email:", error);
        }
    }

    async resetPassword(input: ResetPasswordInput): Promise<void> {
        const tokenHash = this.hashPasswordResetToken(input.token);

        const user =
            await this.authRepository.findUserByPasswordResetTokenHash(tokenHash);

        if (!user || !user.password_reset_expires_at) {
            throw new BadRequestError("Invalid or expired reset token");
        }

        if (user.password_reset_expires_at.getTime() < Date.now()) {
            throw new BadRequestError("Invalid or expired reset token");
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        await this.authRepository.updatePasswordAndClearResetToken({
            userId: user.id,
            passwordHash,
        });
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

    private hashPasswordResetToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    //#endregion
}