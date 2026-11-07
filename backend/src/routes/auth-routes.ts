import { Router } from "express";
import { login, logout } from "../controllers/auth-controller";
import { issueCsrfToken, requireCsrf } from "../middlewares/csrf";

export function createAuthRoutes(): Router {
  const router = Router();

  router.post("/login", requireCsrf, login);
  router.post("/logout", requireCsrf, logout);
  router.get("/csrf-token", issueCsrfToken);

  return router;
}
