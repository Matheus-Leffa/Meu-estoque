import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  authConfig,
  authCookieOptions,
} from "../auth/auth-config";

export async function login(request: Request, response: Response): Promise<void> {
  const password = request.body?.password;

  if (typeof password !== "string" || password.length === 0) {
    response.status(400).json({ error: "A senha é obrigatória." });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, authConfig.passwordHash);
  if (!passwordMatches) {
    response.status(401).json({ error: "Senha inválida." });
    return;
  }

  const signOptions: jwt.SignOptions = {
    expiresIn: authConfig.jwtExpiresIn as NonNullable<
      jwt.SignOptions["expiresIn"]
    >,
  };
  const token = jwt.sign(
    { authenticated: true },
    authConfig.jwtSecret,
    signOptions,
  );

  response.cookie("meuestoque_token", token, authCookieOptions);
  response.status(204).send();
}

export function logout(_request: Request, response: Response): void {
  response.clearCookie("meuestoque_token", authCookieOptions);
  response.status(204).send();
}
