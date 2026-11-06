import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../models/product";
import { ProductRepository } from "../repositories/product-repository";

export class ProductServiceError extends Error {
  public readonly code:
    | "INVALID_PRODUCT"
    | "INVALID_PRODUCT_ID"
    | "PRODUCT_NOT_FOUND";

  public constructor(
    message: string,
    code: "INVALID_PRODUCT" | "INVALID_PRODUCT_ID" | "PRODUCT_NOT_FOUND",
  ) {
    super(message);
    this.name = "ProductServiceError";
    this.code = code;
  }
}

function normalizeText(value: string, fieldName: string): string {
  if (typeof value !== "string") {
    throw new ProductServiceError(
      `O campo ${fieldName} deve ser um texto.`,
      "INVALID_PRODUCT",
    );
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length === 0) {
    throw new ProductServiceError(
      `O campo ${fieldName} é obrigatório.`,
      "INVALID_PRODUCT",
    );
  }

  return normalizedValue;
}

function validateProductInput(
  input: CreateProductInput | UpdateProductInput,
): CreateProductInput {
  const quantidade = input.quantidade;
  const valorCentavos = input.valorCentavos;

  if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
    throw new ProductServiceError(
      "A quantidade deve ser um número inteiro maior ou igual a zero.",
      "INVALID_PRODUCT",
    );
  }

  if (!Number.isSafeInteger(valorCentavos) || valorCentavos <= 0) {
    throw new ProductServiceError(
      "O valor deve ser um número inteiro positivo em centavos.",
      "INVALID_PRODUCT",
    );
  }

  return {
    referencia: normalizeText(input.referencia, "referência"),
    descricao: normalizeText(input.descricao, "descrição"),
    marca: normalizeText(input.marca, "marca"),
    quantidade,
    valorCentavos,
  };
}

function validateProductId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ProductServiceError(
      "O identificador do produto deve ser um inteiro positivo.",
      "INVALID_PRODUCT_ID",
    );
  }
}

export class ProductService {
  private readonly repository: ProductRepository;

  public constructor(repository: ProductRepository = new ProductRepository()) {
    this.repository = repository;
  }

  public listProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  public async getProductById(id: number): Promise<Product> {
    validateProductId(id);

    const product = await this.repository.findById(id);
    if (product === null) {
      throw new ProductServiceError(
        "Produto não encontrado.",
        "PRODUCT_NOT_FOUND",
      );
    }

    return product;
  }

  public createProduct(input: CreateProductInput): Promise<Product> {
    return this.repository.create(validateProductInput(input));
  }

  public async updateProduct(
    id: number,
    input: UpdateProductInput,
  ): Promise<Product> {
    validateProductId(id);

    const product = await this.repository.update(
      id,
      validateProductInput(input),
    );
    if (product === null) {
      throw new ProductServiceError(
        "Produto não encontrado.",
        "PRODUCT_NOT_FOUND",
      );
    }

    return product;
  }

  public async deleteProduct(id: number): Promise<void> {
    validateProductId(id);

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new ProductServiceError(
        "Produto não encontrado.",
        "PRODUCT_NOT_FOUND",
      );
    }
  }
}
