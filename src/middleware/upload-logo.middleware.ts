import multer from "multer";
import { AppError } from "../errors/app-error.js";

const maxLogoFileSizeInBytes = 5 * 1024 * 1024;

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/svg+xml", "application/pdf",]);

export const uploadLogoMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxLogoFileSizeInBytes,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          "Format de fichier non autorisé. Utilisez une image PNG, JPEG ou WebP.",
          400
        )
      );
      return;
    }

    callback(null, true);
  },
});