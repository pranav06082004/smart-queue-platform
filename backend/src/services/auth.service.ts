import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

const SALT_ROUNDS = 10;

export class AuthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "CUSTOMER" | "STAFF" = "CUSTOMER"
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("EMAIL_ALREADY_EXISTS", "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, role },
  });

  const token = signToken(user.id, user.role);

  return { user: sanitizeUser(user), token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const token = signToken(user.id, user.role);

  return { user: sanitizeUser(user), token };
}

function signToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: "7d" });
}

// Never send passwordHash back to the client, ever.
function sanitizeUser(user: { id: string; email: string; name: string; role: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}