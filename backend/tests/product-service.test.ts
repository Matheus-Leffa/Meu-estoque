import { describe, expect, it, jest } from "@jest/globals";
import type { ProductRepository } from "../src/repositories/product-repository";
import { ProductService, ProductServiceError } from "../src/services/product-service";

type ProductRepositoryMock = {
  [K in
    | "findAll"
    | "findBySearch"
    | "findById"
    | "create"
    | "update"
    | "delete"]: jest.MockedFunction<ProductRepository[K]>;
};

function createRepositoryMock(): ProductRepositoryMock & ProductRepository {
  return {
    findAll: jest.fn(),
    findBySearch: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as ProductRepositoryMock & ProductRepository;
}

describe("ProductService", () => {
  it("normaliza textos e preserva valores válidos no cadastro", async () => {
    const repository = createRepositoryMock();
    const product = {
      id: 1,
      referencia: "REF-1",
      descricao: "Produto",
      marca: "Marca",
      quantidade: 3,
      valorCentavos: 1050,
    };
    repository.create.mockResolvedValue(product);
    const service = new ProductService(repository);

    await expect(
      service.createProduct({
        referencia: " REF-1 ",
        descricao: " Produto ",
        marca: " Marca ",
        quantidade: 3,
        valorCentavos: 1050,
      }),
    ).resolves.toEqual(product);

    expect(repository.create).toHaveBeenCalledWith({
      referencia: "REF-1",
      descricao: "Produto",
      marca: "Marca",
      quantidade: 3,
      valorCentavos: 1050,
    });
  });

  it.each([
    ["quantidade negativa", { quantidade: -1, valorCentavos: 100 }],
    ["quantidade decimal", { quantidade: 1.5, valorCentavos: 100 }],
    ["valor zero", { quantidade: 1, valorCentavos: 0 }],
    ["valor decimal", { quantidade: 1, valorCentavos: 10.5 }],
  ])("rejeita %s", async (_description, numbers) => {
    const repository = createRepositoryMock();
    const service = new ProductService(repository);

    expect(() =>
      service.createProduct({
        referencia: "REF",
        descricao: "Produto",
        marca: "Marca",
        ...numbers,
      }),
    ).toThrow(ProductServiceError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejeita texto vazio após remover espaços", async () => {
    const repository = createRepositoryMock();
    const service = new ProductService(repository);

    expect(() =>
      service.createProduct({
        referencia: "   ",
        descricao: "Produto",
        marca: "Marca",
        quantidade: 1,
        valorCentavos: 100,
      }),
    ).toThrow(
      new ProductServiceError("O campo referência é obrigatório.", "INVALID_PRODUCT"),
    );
  });

  it("retorna erro quando o produto não existe", async () => {
    const repository = createRepositoryMock();
    repository.findById.mockResolvedValue(null);
    const service = new ProductService(repository);

    await expect(service.getProductById(99)).rejects.toMatchObject({
      code: "PRODUCT_NOT_FOUND",
    });
  });

  it("pesquisa por campo e termo parcial sem aplicar validações de cadastro", async () => {
    const repository = createRepositoryMock();
    const products = [
      {
        id: 1,
        referencia: "LUM-001",
        descricao: "Embutido LED",
        marca: "Stella",
        quantidade: 2,
        valorCentavos: 1000,
      },
    ];
    repository.findBySearch.mockResolvedValue(products);
    const service = new ProductService(repository);

    await expect(
      service.listProducts({ campo: "marca", termo: " Ste " }),
    ).resolves.toEqual(products);

    expect(repository.findBySearch).toHaveBeenCalledWith({
      campo: "marca",
      termo: "Ste",
    });
  });

  it("rejeita coluna ou termo de pesquisa inválidos", () => {
    const repository = createRepositoryMock();
    const service = new ProductService(repository);

    expect(() =>
      service.listProducts({ campo: "invalida" as never, termo: "produto" }),
    ).toThrow(
      new ProductServiceError(
        "A coluna de pesquisa é inválida.",
        "INVALID_PRODUCT_SEARCH",
      ),
    );
    expect(() =>
      service.listProducts({ campo: "marca", termo: "   " }),
    ).toThrow(
      new ProductServiceError(
        "O termo de pesquisa não pode ser vazio.",
        "INVALID_PRODUCT_SEARCH",
      ),
    );
    expect(repository.findBySearch).not.toHaveBeenCalled();
  });
});
