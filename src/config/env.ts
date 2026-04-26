if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export const env = {
    port: Number(process.env.PORT) || 4000,
    databaseUrl: process.env.DATABASE_URL,
    frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
}