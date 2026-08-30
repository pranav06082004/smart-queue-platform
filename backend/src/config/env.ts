import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  rabbitmqUrl: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is not set. Check your .env file.");
}