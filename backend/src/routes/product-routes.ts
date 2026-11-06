import { Router } from "express";
import { ProductController } from "../controllers/product-controller";

export function createProductRoutes(
  controller: ProductController = new ProductController(),
): Router {
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}
