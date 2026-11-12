export interface Product {
  id: number;
  referencia: string;
  descricao: string;
  marca: string;
  quantidade: number;
  valorCentavos: number;
}

export interface CreateProductInput {
  referencia: string;
  descricao: string;
  marca: string;
  quantidade: number;
  valorCentavos: number;
}

export type UpdateProductInput = CreateProductInput;

export type ProductSearchField = "referencia" | "descricao" | "marca";

export interface ProductSearchInput {
  campo: ProductSearchField;
  termo: string;
}
