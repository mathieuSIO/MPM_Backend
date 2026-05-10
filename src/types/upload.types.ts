export type UploadedLogoResponse = {
  url: string;
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  size: number;
};

export type AllowedLogoMimeType = "image/png" | "image/jpeg" | "application/pdf" | "image/svg+xml";