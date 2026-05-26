export type ProductType = 'tshirt';

export enum Color {
  BLACK = "black",
  WHITE = "white"
}

export type Product = {
  type: ProductType;
  basePrice: number;
  color: Color
};