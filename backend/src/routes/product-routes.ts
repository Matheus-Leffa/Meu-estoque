import { Router } from "express";
import { ProductController } from "../controllers/product-controller";
import { requireAuthentication } from "../middlewares/authentication";
import { requireCsrf } from "../middlewares/csrf";

export function createProductRoutes(
  controller: ProductController = new ProductController(),
): Router {
  const router = Router();

  router.use(requireAuthentication);
  router.use(requireCsrf);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}
