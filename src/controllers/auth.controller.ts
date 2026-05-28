import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
    constructor(private readonly authService = new AuthService()) { }

    register = async (req: Request, res: Response): Promise<void> => {
        const result = await this.authService.register(req.body);

        res.status(201).json({
            success: true,
            data: result,
        });
    };

    login = async (req: Request, res: Response): Promise<void> => {
        const result = await this.authService.login(req.body);

        res.status(200).json({
            success: true,
            data: result,
        });
    };

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        await this.authService.forgotPassword(req.body);

        res.status(200).json({
            success: true,
            message:
                "If an account exists for this email, a password reset link has been sent.",
        });
    };

    resetPassword = async (req: Request, res: Response): Promise<void> => {
        await this.authService.resetPassword(req.body);

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully.",
        });
    };

    verifyEmail = async (req: Request, res: Response): Promise<void> => {
        await this.authService.verifyEmail({
            token: String(req.query.token ?? ""),
        });

        res.status(200).json({
            success: true,
            message: "Email verified successfully.",
        });
    };

    resendVerificationEmail = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        await this.authService.resendVerificationEmail(req.body);

        res.status(200).json({
            success: true,
            message:
                "If an account exists and is not verified, a verification email has been sent.",
        });
    };
}