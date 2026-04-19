//A retravailler pour le calcul du prix lorsque j'aurais plusieurs produits 
export type ProductType = "tshirt";

export enum Color {
  BLACK = "black",
  WHITE = "white"
}

export type Product = {
  type: ProductType;
  color: Color;
  basePrice: number;
};