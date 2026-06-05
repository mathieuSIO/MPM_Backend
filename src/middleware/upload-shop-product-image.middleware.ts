import multer from "multer";
import { AppError } from "../errors/app-error.js";

const maxShopProductImageFileSizeInBytes = 50 * 1024 * 1024;

const allowedMimeTypes = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
]);

export const uploadShopProductImageMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: maxShopProductImageFileSizeInBytes,
    },
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            callback(
                new AppError(
                    "Format de fichier non autorisé. Utilisez une image PNG, JPEG ou WEBP.",
                    400
                )
            );
            return;
        }

        callback(null, true);
    },
});