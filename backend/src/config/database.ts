import "dotenv/config";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("A variável de ambiente DATABASE_URL é obrigatória.");
}

export const databasePool = new Pool({
  connectionString: databaseUrl,
});
