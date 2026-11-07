import type { NextFunction, Request, Response } from "express";
import type { CheckoutInput } from "../models/order";
import { CheckoutService } from "../services/checkout-service";

export class CheckoutController {
  private readonly service: CheckoutService;

  public constructor(service: CheckoutService = new CheckoutService()) {
    this.service = service;
  }

  public checkout = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.service.checkout(request.body as CheckoutInput);
      if (result === "processed") {
        response.status(204).send();
        return;
      }

      response
        .status(200)
        .json({ message: "A baixa deste pedido já foi processada." });
    } catch (error) {
      next(error);
    }
  };
}
