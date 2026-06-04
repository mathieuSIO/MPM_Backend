import type { Request, Response } from "express";
import { ShopProductService } from "../services/shop-product.service.js";

export class ShopProductController {
    constructor(private readonly service = new ShopProductService()) { }

    getProducts = async (_req: Request, res: Response): Promise<void> => {
        const products =
            await this.service.getProducts();

        res.status(200).json({
            success: true,
            data: products,
        });
    };

    getProduct = async (req: Request, res: Response): Promise<void> => {
        const slug = req.params.slug;

        if (typeof slug !== "string" || slug.length === 0) {
            res.status(400).json({
                success: false,
                message: "Invalid product slug",
            });
            return;
        }

        const product = await this.service.getProduct(slug);

        res.status(200).json({
            success: true,
            data: product,
        });
    };
}