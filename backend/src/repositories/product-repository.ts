import type { Pool, QueryResultRow } from "pg";
import { databasePool } from "../config/database";
import type {
  CreateProductInput,
  Product,
  ProductSearchInput,
  UpdateProductInput,
} from "../models/product";

interface ProductRow extends QueryResultRow {
  id: number | string;
  referencia: string;
  descricao: string;
  marca: string;
  quantidade: number;
  valor_centavos: number | string;
}

function mapProduct(row: ProductRow): Product {
  const id = Number(row.id);
  const valorCentavos = Number(row.valor_centavos);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("O identificador armazenado está fora do limite seguro.");
  }

  if (!Number.isSafeInteger(valorCentavos)) {
    throw new Error("O valor monetário armazenado está fora do limite seguro.");
  }

  return {
    id,
    referencia: row.referencia,
    descricao: row.descricao,
    marca: row.marca,
    quantidade: row.quantidade,
    valorCentavos,
  };
}

export class ProductRepository {
  private readonly pool: Pool;
  private readonly searchableColumns: Record<
    ProductSearchInput["campo"],
    string
  > = {
    referencia: "referencia",
    descricao: "descricao",
    marca: "marca",
  };

  public constructor(pool: Pool = databasePool) {
    this.pool = pool;
  }

  public async findAll(): Promise<Product[]> {
    const result = await this.pool.query<ProductRow>(
      `SELECT id, referencia, descricao, marca, quantidade, valor_centavos
       FROM produtos
       ORDER BY id`,
    );

    return result.rows.map(mapProduct);
  }

  public async findBySearch(input: ProductSearchInput): Promise<Product[]> {
    const column = this.searchableColumns[input.campo];
    const escapedTerm = input.termo.replace(/[\\%_]/g, "\\$&");
    const result = await this.pool.query<ProductRow>(
      `SELECT id, referencia, descricao, marca, quantidade, valor_centavos
       FROM produtos
       WHERE ${column} ILIKE $1 ESCAPE '\\'
       ORDER BY id`,
      [`%${escapedTerm}%`],
    );

    return result.rows.map(mapProduct);
  }

  public async findById(id: number): Promise<Product | null> {
    const result = await this.pool.query<ProductRow>(
      `SELECT id, referencia, descricao, marca, quantidade, valor_centavos
       FROM produtos
       WHERE id = $1`,
      [id],
    );

    const row = result.rows[0];
    return row === undefined ? null : mapProduct(row);
  }

  public async create(input: CreateProductInput): Promise<Product> {
    const result = await this.pool.query<ProductRow>(
      `INSERT INTO produtos
         (referencia, descricao, marca, quantidade, valor_centavos)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, referencia, descricao, marca, quantidade, valor_centavos`,
      [
        input.referencia,
        input.descricao,
        input.marca,
        input.quantidade,
        input.valorCentavos,
      ],
    );

    const row = result.rows[0];
    if (row === undefined) {
      throw new Error("O PostgreSQL não retornou o produto criado.");
    }

    return mapProduct(row);
  }

  public async update(
    id: number,
    input: UpdateProductInput,
  ): Promise<Product | null> {
    const result = await this.pool.query<ProductRow>(
      `UPDATE produtos
       SET referencia = $1,
           descricao = $2,
           marca = $3,
           quantidade = $4,
           valor_centavos = $5
       WHERE id = $6
       RETURNING id, referencia, descricao, marca, quantidade, valor_centavos`,
      [
        input.referencia,
        input.descricao,
        input.marca,
        input.quantidade,
        input.valorCentavos,
        id,
      ],
    );

    const row = result.rows[0];
    return row === undefined ? null : mapProduct(row);
  }

  public async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM produtos WHERE id = $1",
      [id],
    );

    return result.rowCount === 1;
  }
}
