import express from "express";
import { errorHandler } from "./middlewares/error-handler";
import { createProductRoutes } from "./routes/product-routes";

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());
  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });
  app.use("/api/products", createProductRoutes());
  app.use(errorHandler);

  return app;
}
