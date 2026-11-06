import type { ErrorRequestHandler } from "express";
import { ProductServiceError } from "../services/product-service";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ProductServiceError) {
    const statusCode =
      error.code === "PRODUCT_NOT_FOUND"
        ? 404
        : error.code === "INVALID_PRODUCT_ID" ||
            error.code === "INVALID_PRODUCT"
          ? 400
          : 500;

    response.status(statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "Erro interno do servidor." });
};
