import { Router } from "express";
import { login, logout } from "../controllers/auth-controller";
import { issueCsrfToken } from "../middlewares/csrf";

export function createAuthRoutes(): Router {
  const router = Router();

  router.post("/login", login);
  router.post("/logout", logout);
  router.get("/csrf-token", issueCsrfToken);

  return router;
}
