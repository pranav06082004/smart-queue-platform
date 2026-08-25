import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  databaseUrl: process.env.DATABASE_URL ?? "",
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}