import { Router } from "express";
import { CheckoutController } from "../controllers/checkout-controller";
import { requireAuthentication } from "../middlewares/authentication";
import { requireCsrf } from "../middlewares/csrf";

export function createCheckoutRoutes(
  controller: CheckoutController = new CheckoutController(),
): Router {
  const router = Router();

  router.use(requireAuthentication);
  router.use(requireCsrf);
  router.post("/", controller.checkout);

  return router;
}
