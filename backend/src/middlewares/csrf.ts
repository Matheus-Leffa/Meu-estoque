import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const csrfCookieName = "meuestoque_csrf";
const csrfHeaderName = "x-csrf-token";

export function issueCsrfToken(_request: Request, response: Response): void {
  const token = randomBytes(32).toString("hex");
  response.cookie(csrfCookieName, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  response.status(204).send();
}

export function requireCsrf(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    next();
    return;
  }

  const cookieToken = request.cookies?.[csrfCookieName];
  const headerToken = request.get(csrfHeaderName);

  if (
    typeof cookieToken !== "string" ||
    typeof headerToken !== "string" ||
    cookieToken.length !== headerToken.length ||
    !timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    response.status(403).json({ error: "Token CSRF inválido ou ausente." });
    return;
  }

  next();
}
