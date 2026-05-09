import type { ProductRepository } from "../repositories/product.repository.js";
import type { ProductCatalogItem } from "../types/product.repository.types.js";


export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getActiveProductCatalog(): Promise<ProductCatalogItem[]> {
    return this.productRepository.findActiveProducts();
  }
}