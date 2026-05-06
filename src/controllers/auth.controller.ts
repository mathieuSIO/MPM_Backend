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
}