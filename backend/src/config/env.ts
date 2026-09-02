import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  rabbitmqUrl: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
  llmApiKey: process.env.LLM_API_KEY ?? "",
  llmApiUrl: process.env.LLM_API_URL ?? "https://api.groq.com/openai/v1/chat/completions",
  llmModel: process.env.LLM_MODEL ?? "llama-3.1-8b-instant",
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not set. Check your .env file.");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is not set. Check your .env file.");
}