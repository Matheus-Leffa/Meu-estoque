import type { NextFunction, Request, Response } from "express";
import { passport, type AuthenticatedUser } from "../auth/passport";

export function requireAuthentication(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  passport.authenticate(
    "jwt",
    { session: false },
    (error: unknown, user: AuthenticatedUser | false | null) => {
    if (error) {
      next(error);
      return;
    }

    if (!user) {
      response.status(401).json({ error: "Autenticação necessária." });
      return;
    }

    request.user = user;
    next();
    },
  )(request, response, next);
}
