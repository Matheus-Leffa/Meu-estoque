export interface CheckoutItemInput {
  produtoId: number;
  quantidadePedido: number;
  valorUnitario: number;
}

export interface CheckoutInput {
  chaveIdempotencia: string;
  itens: CheckoutItemInput[];
}
