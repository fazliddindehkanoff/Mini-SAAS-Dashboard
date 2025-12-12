import jwt, { SignOptions } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || ""
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

// Validate JWT_SECRET at runtime, not during build
export function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error(
      "Please define the JWT_SECRET environment variable inside .env.local"
    )
  }
  return JWT_SECRET
}

export interface JWTPayload {
  id: string
  email: string
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions)
}

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

