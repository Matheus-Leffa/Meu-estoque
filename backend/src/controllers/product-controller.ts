import type { NextFunction, Request, Response } from "express";
import type {
  CreateProductInput,
  ProductSearchField,
  ProductSearchInput,
  UpdateProductInput,
} from "../models/product";
import {
  ProductService,
  ProductServiceError,
} from "../services/product-service";

function parseProductId(value: unknown): number {
  return typeof value === "string" ? Number(value) : Number.NaN;
}

function isProductSearchField(value: string): value is ProductSearchField {
  return (
    value === "referencia" || value === "descricao" || value === "marca"
  );
}

function parseProductSearch(
  campo: unknown,
  termo: unknown,
): ProductSearchInput | undefined {
  if (campo === undefined && termo === undefined) return undefined;
  if (typeof campo !== "string" || typeof termo !== "string") {
    throw new ProductServiceError(
      "Os parâmetros de pesquisa são inválidos.",
      "INVALID_PRODUCT_SEARCH",
    );
  }
  if (!isProductSearchField(campo)) {
    throw new ProductServiceError(
      "A coluna de pesquisa é inválida.",
      "INVALID_PRODUCT_SEARCH",
    );
  }

  return {
    campo,
    termo,
  };
}

export class ProductController {
  private readonly service: ProductService;

  public constructor(service: ProductService = new ProductService()) {
    this.service = service;
  }

  public list = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response
        .status(200)
        .json(
          await this.service.listProducts(
            parseProductSearch(request.query.campo, request.query.termo),
          ),
        );
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
