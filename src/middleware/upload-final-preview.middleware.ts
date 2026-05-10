import multer from "multer";
import { AppError } from "../errors/app-error.js";
const maxFinalPreviewFileSizeInBytes = 5 * 1024 * 1024;

const allowedMimeTypes = new Set(["image/png", "image/jpeg"]);

export const uploadFinalPreviewMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFinalPreviewFileSizeInBytes,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          "Format de fichier non autorisé. Utilisez une image PNG ou JPEG.",
          400
        )
      );
      return;
    }

    callback(null, true);
  },
});