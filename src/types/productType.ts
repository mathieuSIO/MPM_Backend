export type ProductType = 'cap' | 'other' | 'polo' | 'sweatshirt' | 'tshirt';

export enum Color {
  BLACK = "black",
  WHITE = "white"
}

export type Product = {
  type: ProductType;
  color: Color;
  basePrice: number;
};