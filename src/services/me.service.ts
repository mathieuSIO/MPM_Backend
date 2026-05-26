import bcrypt from "bcrypt";

import { UnauthorizedError, NotFoundError } from "../errors/http-errors.js";
import { MeRepository } from "../repositories/me.repository.js";
import type {
    ChangePasswordInput,
    MeUserRow,
    PublicMeUser,
    UpdateMeInput,
} from "../types/me.types.js";

export class MeService {
    constructor(private readonly meRepository = new MeRepository()) {}

    async getMe(userId: number): Promise<PublicMeUser> {
        const user = await this.meRepository.findById(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return this.toPublicUser(user);
    }

    async updateMe(
        userId: number,
        input: UpdateMeInput
    ): Promise<PublicMeUser> {
        const user = await this.meRepository.updateProfile(userId, input);

        return this.toPublicUser(user);
    }

    async changePassword(
        userId: number,
        input: ChangePasswordInput
    ): Promise<void> {
        const user = await this.meRepository.findPasswordHashById(userId);

        if (!user || !user.password_hash) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
            input.currentPassword,
            user.password_hash
        );

        if (!isValid) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const passwordHash = await bcrypt.hash(input.newPassword, 10);

        await this.meRepository.updatePassword(userId, passwordHash);
    }

    private toPublicUser(user: MeUserRow): PublicMeUser {
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
}