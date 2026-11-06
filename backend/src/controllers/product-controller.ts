import type { NextFunction, Request, Response } from "express";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../models/product";
import { ProductService } from "../services/product-service";

function parseProductId(value: unknown): number {
  return typeof value === "string" ? Number(value) : Number.NaN;
}

export class ProductController {
  private readonly service: ProductService;

  public constructor(service: ProductService = new ProductService()) {
    this.service = service;
  }

  public list = async (
    _request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.status(200).json(await this.service.listProducts());
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response
        .status(200)
        .json(await this.service.getProductById(parseProductId(request.params.id)));
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response
        .status(201)
        .json(
          await this.service.createProduct(request.body as CreateProductInput),
        );
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.status(200).json(
        await this.service.updateProduct(
          parseProductId(request.params.id),
          request.body as UpdateProductInput,
        ),
      );
    } catch (error) {
      next(error);
    }
  };

  public remove = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.service.deleteProduct(parseProductId(request.params.id));
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
