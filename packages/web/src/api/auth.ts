import { SignJWT, jwtVerify } from "jose";
import type { Context, Next } from "hono";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "demolay-secret-fallback-change-in-prod"
);

const ADMIN_USER = process.env.ADMIN_USER ?? "demolaycup";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "2026";

export async function createToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export function validateCredentials(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASSWORD;
}

// Middleware — protege rutas que modifican datos
export async function requireAdmin(c: Context, next: Next) {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = auth.slice(7);
  const valid = await verifyToken(token);
  if (!valid) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
  await next();
}
