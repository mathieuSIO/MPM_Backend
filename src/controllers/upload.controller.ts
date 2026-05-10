import type { Request, Response } from "express";

import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "../types/authenticated-request.types.js";
import { UploadService } from "../services/upload.service.js";
import { AppError } from "../errors/app-error.js";

const uploadService = new UploadService();

export class UploadController {
  async uploadLogo(req: Request, res: Response): Promise<void> {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      throw new AppError("Utilisateur non authentifié.", 401);
    }

    if (!authenticatedReq.file) {
      throw new AppError("Aucun fichier envoyé.", 400);
    }

    const uploadedFile = await uploadService.saveLogoFile({
      file: authenticatedReq.file,
      userId: authenticatedReq.user.userId,
      publicApiUrl: env.apiPublicUrl,
    });

    res.status(201).json({
      success: true,
      data: uploadedFile,
    });
  }

  async uploadFinalPreview(req: Request, res: Response): Promise<void> {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      throw new AppError("Utilisateur non authentifié.", 401);
    }

    if (!authenticatedReq.file) {
      throw new AppError("Aucun fichier envoyé.", 400);
    }

    const uploadedFile = await uploadService.saveFinalPreviewFile({
      file: authenticatedReq.file,
      userId: authenticatedReq.user.userId,
      publicApiUrl: env.apiPublicUrl,
    });

    res.status(201).json({
      success: true,
      data: uploadedFile,
    });
  }
}