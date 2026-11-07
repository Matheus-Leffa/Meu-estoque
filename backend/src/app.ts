import express from "express";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { passport } from "./auth/passport";
import { frontendUrl } from "./config/http";
import { errorHandler } from "./middlewares/error-handler";
import { createAuthRoutes } from "./routes/auth-routes";
import { createCheckoutRoutes } from "./routes/checkout-routes";
import { createProductRoutes } from "./routes/product-routes";

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", createAuthRoutes());
  app.use("/api/products", createProductRoutes());
  app.use("/api/checkout", createCheckoutRoutes());

  const frontendPath = path.resolve(process.cwd(), "../frontend");
  app.use(express.static(frontendPath));
  
  app.use(errorHandler);

  return app;
}
