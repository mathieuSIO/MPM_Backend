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

    getAdminProducts = async (
        _req: Request,
        res: Response
    ): Promise<void> => {
        const products = await this.service.getAdminProducts();

        res.status(200).json({
            success: true,
            data: products,
        });
    };

    createAdminProduct = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const product = await this.service.createAdminProduct(req.body);

        res.status(201).json({
            success: true,
            data: product,
        });
    };

    updateAdminProduct = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const productId = Number(req.params.productId);

        const product = await this.service.updateAdminProduct(
            productId,
            req.body
        );

        res.status(200).json({
            success: true,
            data: product,
        });
    };

    updateAdminProductStatus = async (req: Request, res: Response): Promise<void> => {
        const productId = Number(req.params.productId);

        const product = await this.service.updateAdminProductStatus(
            productId,
            req.body.isActive
        );

        res.status(200).json({
            success: true,
            data: product,
        });
    };

    uploadAdminProductImage = async (req: Request, res: Response): Promise<void> => {
        const result = await this.service.uploadAdminProductImage(req.file);

        res.status(201).json({
            success: true,
            data: result,
        });
    };

    getAdminProductVariants = async (req: Request, res: Response): Promise<void> => {
        const productId = Number(req.params.productId);

        const variants = await this.service.getAdminProductVariants(productId);

        res.status(200).json({
            success: true,
            data: variants,
        });
    };

    createAdminProductVariant = async (req: Request, res: Response): Promise<void> => {
        const productId = Number(req.params.productId);

        const variant = await this.service.createAdminProductVariant(
            productId,
            req.body
        );

        res.status(201).json({
            success: true,
            data: variant,
        });
    };

    updateAdminProductVariant = async (req: Request, res: Response): Promise<void> => {
        const productId = Number(req.params.productId);
        const variantId = Number(req.params.variantId);

        const variant = await this.service.updateAdminProductVariant(
            productId,
            variantId,
            req.body
        );

        res.status(200).json({
            success: true,
            data: variant,
        });
    };

    updateAdminProductVariantStatus = async (req: Request, res: Response): Promise<void> => {
        const productId = Number(req.params.productId);
        const variantId = Number(req.params.variantId);

        const variant = await this.service.updateAdminProductVariantStatus(
            productId,
            variantId,
            req.body.isActive
        );

        res.status(200).json({
            success: true,
            data: variant,
        });
    };

}