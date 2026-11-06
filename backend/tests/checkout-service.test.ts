import type { Pool, PoolClient } from "pg";
import {
  CheckoutService,
  CheckoutServiceError,
} from "../src/services/checkout-service";

const checkoutInput = {
  chaveIdempotencia: "550e8400-e29b-41d4-a716-446655440000",
  itens: [{ produtoId: 1, quantidadePedido: 2, valorUnitario: 1000 }],
};

function createClientMock() {
  return {
    query: jest.fn(),
    release: jest.fn(),
  } as unknown as jest.Mocked<PoolClient>;
}

function createPoolMock(client: PoolClient) {
  return { connect: jest.fn().mockResolvedValue(client) } as unknown as Pool;
}

describe("CheckoutService", () => {
  it("atualiza o estoque dentro de uma transação", async () => {
    const client = createClientMock();
    client.query
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({ rowCount: 1 } as never)
      .mockResolvedValueOnce({
        rows: [{ id: 1, quantidade: 5 }],
      } as never)
      .mockResolvedValueOnce({ rowCount: 1 } as never)
      .mockResolvedValueOnce({} as never);
    const service = new CheckoutService(createPoolMock(client));

    await expect(service.checkout(checkoutInput)).resolves.toBe("processed");

    expect(client.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(client.query).toHaveBeenNthCalledWith(5, "COMMIT");
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("SET quantidade = quantidade - $1"),
      [2, 1],
    );
    expect(client.release).toHaveBeenCalled();
  });

  it("faz rollback quando o estoque é insuficiente", async () => {
    const client = createClientMock();
    client.query
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({ rowCount: 1 } as never)
      .mockResolvedValueOnce({
        rows: [{ id: 1, quantidade: 1 }],
      } as never)
      .mockResolvedValueOnce({} as never);
    const service = new CheckoutService(createPoolMock(client));

    await expect(service.checkout(checkoutInput)).rejects.toMatchObject({
      code: "CHECKOUT_STOCK_UNAVAILABLE",
    });
    expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");
  });

  it("não repete baixa para a mesma chave de idempotência", async () => {
    const client = createClientMock();
    client.query
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({ rowCount: 0 } as never)
      .mockResolvedValueOnce({} as never);
    const service = new CheckoutService(createPoolMock(client));

    await expect(service.checkout(checkoutInput)).resolves.toBe(
      "already_processed",
    );
    expect(client.query).toHaveBeenLastCalledWith("COMMIT");
    expect(client.query).not.toHaveBeenCalledWith(
      expect.stringContaining("SET quantidade"),
      expect.anything(),
    );
  });

  it("rejeita produtos duplicados no mesmo pedido", async () => {
    const service = new CheckoutService(createPoolMock(createClientMock()));
    const duplicateInput = {
      ...checkoutInput,
      itens: [...checkoutInput.itens, checkoutInput.itens[0]],
    };

    await expect(service.checkout(duplicateInput)).rejects.toBeInstanceOf(
      CheckoutServiceError,
    );
  });
});
