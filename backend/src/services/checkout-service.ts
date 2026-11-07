import type { Pool, PoolClient, QueryResultRow } from "pg";
import { databasePool } from "../config/database";
import type { CheckoutInput, CheckoutItemInput } from "../models/order";

type CheckoutErrorCode =
  | "INVALID_CHECKOUT"
  | "CHECKOUT_STOCK_UNAVAILABLE"
  | "CHECKOUT_ALREADY_PROCESSED";

export class CheckoutServiceError extends Error {
  public readonly code: CheckoutErrorCode;

  public constructor(message: string, code: CheckoutErrorCode) {
    super(message);
    this.name = "CheckoutServiceError";
    this.code = code;
  }
}

interface ProductStockRow extends QueryResultRow {
  id: number | string;
  quantidade: number;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateInput(input: CheckoutInput): CheckoutItemInput[] {
  if (
    typeof input !== "object" ||
    input === null ||
    typeof input.chaveIdempotencia !== "string" ||
    !uuidPattern.test(input.chaveIdempotencia) ||
    !Array.isArray(input.itens) ||
    input.itens.length === 0
  ) {
    throw new CheckoutServiceError(
      "O pedido informado é inválido.",
      "INVALID_CHECKOUT",
    );
  }

  const productIds = new Set<number>();
  for (const item of input.itens) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.produtoId !== "number" ||
      !Number.isSafeInteger(item.produtoId) ||
      item.produtoId <= 0 ||
      !Number.isSafeInteger(item.quantidadePedido) ||
      item.quantidadePedido <= 0 ||
      !Number.isSafeInteger(item.valorUnitario) ||
      item.valorUnitario <= 0 ||
      productIds.has(item.produtoId)
    ) {
      throw new CheckoutServiceError(
        "O pedido informado é inválido.",
        "INVALID_CHECKOUT",
      );
    }
    productIds.add(item.produtoId);
  }

  return input.itens;
}

export class CheckoutService {
  private readonly pool: Pool;

  public constructor(pool: Pool = databasePool) {
    this.pool = pool;
  }

  public async checkout(input: CheckoutInput): Promise<"processed" | "already_processed"> {
    const items = validateInput(input);
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const idempotencyResult = await client.query(
        `INSERT INTO baixas_processadas (chave_idempotencia)
         VALUES ($1)
         ON CONFLICT (chave_idempotencia) DO NOTHING`,
        [input.chaveIdempotencia],
      );

      if (idempotencyResult.rowCount === 0) {
        await client.query("COMMIT");
        return "already_processed";
      }

      const productIds = items.map((item) => item.produtoId).sort((a, b) => a - b);
      const stockResult = await client.query<ProductStockRow>(
        `SELECT id, quantidade
         FROM produtos
         WHERE id = ANY($1::bigint[])
         ORDER BY id
         FOR UPDATE`,
        [productIds],
      );
      const stockById = new Map(
        stockResult.rows.map((row) => [Number(row.id), row.quantidade]),
      );

      for (const item of items) {
        const available = stockById.get(item.produtoId);
        if (available === undefined || available < item.quantidadePedido) {
          throw new CheckoutServiceError(
            "Não há estoque suficiente para concluir o pedido.",
            "CHECKOUT_STOCK_UNAVAILABLE",
          );
        }
      }

      for (const item of items) {
        await client.query(
          `UPDATE produtos
           SET quantidade = quantidade - $1
           WHERE id = $2`,
          [item.quantidadePedido, item.produtoId],
        );
      }

      await client.query("COMMIT");
      return "processed";
    } catch (error) {
      await this.rollback(client, error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async rollback(client: PoolClient, originalError: unknown): Promise<void> {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Falha ao executar ROLLBACK da baixa.", {
        originalError,
        rollbackError,
      });
    }
  }
}
