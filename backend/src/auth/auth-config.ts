import "dotenv/config";

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  passwordHash: process.env.PASSWORD_HASH ?? "",
  isProduction: process.env.NODE_ENV === "production",
};

if (!authConfig.jwtSecret) {
  throw new Error("A variável de ambiente JWT_SECRET é obrigatória.");
}

if (!authConfig.passwordHash) {
  throw new Error("A variável de ambiente PASSWORD_HASH é obrigatória.");
}

export const authCookieOptions = {
  httpOnly: true,
  secure: authConfig.isProduction,
  sameSite: "lax" as const,
  path: "/",
};
