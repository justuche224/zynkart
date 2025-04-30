import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connectionString = process.env.DATABASE_URL;

const sql = postgres(connectionString);
const db = drizzle({ client: sql, schema });

export default db;
