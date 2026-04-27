import { Pool } from "pg";
import { env } from "../config/env.js";

export const db: Pool = new Pool({
    connectionString: env.databaseUrl,
});

export const connectDB = async () => {
  try {
    const client = await db.connect();
    console.log("✅ PostgreSQL connected");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection error", err);
    process.exit(1);
  }
};