import { Pool } from "pg";
import { env } from "../config/env.js"; 

export const db = new Pool({
  connectionString: env.databaseUrl,
});

console.log("DB URL:", env.databaseUrl);