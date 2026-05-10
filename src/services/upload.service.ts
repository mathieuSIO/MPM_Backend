import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

import type {
  AllowedFinalPreviewMimeType,
  AllowedLogoMimeType,
  UploadedFinalPreviewResponse,
  UploadedLogoResponse,
} from "../types/upload.types.js";
import { AppError } from "../errors/app-error.js";

const uploadRootDirectory = path.resolve(process.cwd(), "uploads");

const mimeTypeToExtension: Record<AllowedLogoMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "application/pdf": "pdf",
  "image/svg+xml": "svg",
};

const finalPreviewMimeTypeToExtension: Record<
  AllowedFinalPreviewMimeType,
  string
> = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

type SaveLogoFileParams = {
  file: Express.Multer.File;
  userId: number;
  publicApiUrl: string;
};

export class UploadService {
  async saveLogoFile({ file, userId, publicApiUrl }: SaveLogoFileParams): Promise<UploadedLogoResponse> {
    const mimeType = file.mimetype as AllowedLogoMimeType;
    const extension = mimeTypeToExtension[mimeType];

    if (!extension) {
      throw new AppError(
        "Format de fichier non autorisé. Utilisez un PNG, JPG, SVG ou PDF.",
        400
      );
    }

    const fileName = `${randomUUID()}.${extension}`;
    const storageKey = `logos/${userId}/${fileName}`;

    const targetDirectory = path.join(uploadRootDirectory, "logos", String(userId));
    const targetPath = path.join(targetDirectory, fileName);

    await mkdir(targetDirectory, { recursive: true });
    await writeFile(targetPath, file.buffer);

    const normalizedPublicApiUrl = publicApiUrl.replace(/\/$/, "");
    const url = `${normalizedPublicApiUrl}/uploads/${storageKey}`;

    return {
      url,
      storageKey,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async saveFinalPreviewFile({ file, userId, publicApiUrl }: SaveLogoFileParams): Promise<UploadedFinalPreviewResponse> {
    const mimeType = file.mimetype as AllowedFinalPreviewMimeType;
    const extension = finalPreviewMimeTypeToExtension[mimeType];

    if (!extension) {
      throw new AppError(
        "Format de fichier non autorisé. Utilisez une image PNG ou JPEG.",
        400
      );
    }

    const fileName = `${randomUUID()}.${extension}`;
    const storageKey = `final-previews/${userId}/${fileName}`;

    const targetDirectory = path.join(
      uploadRootDirectory,
      "final-previews",
      String(userId)
    );
    const targetPath = path.join(targetDirectory, fileName);

    await mkdir(targetDirectory, { recursive: true });
    await writeFile(targetPath, file.buffer);

    const normalizedPublicApiUrl = publicApiUrl.replace(/\/$/, "");
    const url = `${normalizedPublicApiUrl}/uploads/${storageKey}`;

    return {
      url,
      storageKey,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}