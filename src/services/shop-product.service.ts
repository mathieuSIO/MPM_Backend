import { NotFoundError } from "../errors/http-errors.js";
import { ShopProductRepository } from "../repositories/shop-product.repository.js";

export class ShopProductService {
    constructor(
        private readonly repository =
            new ShopProductRepository()
    ) { }

    async getProducts() {
        return this.repository.findAllActive();
    }

    async getProduct(slug: string) {
        const product =
            await this.repository.findBySlug(slug);

        if (!product) {
            throw new NotFoundError(
                "Shop product not found"
            );
        }

        return product;
    }
}