import type { Request, Response } from "express";
import type { ProductService } from "../services/product.service.js";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async getCatalog(_req: Request, res: Response): Promise<void> {
    const products = await this.productService.getActiveProductCatalog();

    res.status(200).json({
      success: true,
      data: products,
    });
  }
}