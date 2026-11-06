import express from "express";
import cookieParser from "cookie-parser";
import { passport } from "./auth/passport";
import { errorHandler } from "./middlewares/error-handler";
import { createAuthRoutes } from "./routes/auth-routes";
import { createProductRoutes } from "./routes/product-routes";

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());
  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });
  app.use("/api/auth", createAuthRoutes());
  app.use("/api/products", createProductRoutes());
  app.use(errorHandler);

  return app;
}
