import { ProductService, ProductServiceError } from "../src/services/product-service";

function createRepositoryMock() {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
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
});
