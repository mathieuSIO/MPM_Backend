import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env.js";
import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { ShopProductRepository } from "../repositories/shop-product.repository.js";
import type { ShopProductImage, ShopProductImageRow, ShopProductVariant, ShopProductVariantRow } from "../types/shop-product.types.js";

export class ShopProductService {
    constructor(private readonly repository = new ShopProductRepository()) { }

    async getProducts() {
        return this.repository.findAllActive();
    }

    async getProduct(slug: string) {
        const product = await this.repository.findBySlug(slug);

        if (!product) {
            throw new NotFoundError("Shop product not found");
        }

        const variants = await this.repository.findVariantsByProductId(product.id);

        return {
            ...product,
            variants: variants.map((variant) => ({
                id: variant.id,
                sizeLabel: variant.size_label,
                colorName: variant.color_name,
                colorHex: variant.color_hex,
                sku: variant.sku,
                priceCents: variant.price_cents,
                stockQuantity: variant.stock_quantity,
                imageUrl: variant.image_url,
                imageStorageKey: variant.image_storage_key,
                isActive: variant.is_active,
            })),
        };
    }
    async getAdminProducts() {
        return this.repository.findAllAdmin();
    }

    async createAdminProduct(input: {
        name: string;
        slug: string;
        description?: string | null;
        priceCents: number;
        imageUrl?: string | null;
        imageStorageKey?: string | null;
        isActive?: boolean;
    }) {
        return this.repository.create({
            name: input.name,
            slug: input.slug,
            description: input.description ?? null,
            priceCents: input.priceCents,
            imageUrl: input.imageUrl ?? null,
            imageStorageKey: input.imageStorageKey ?? null,
            isActive: input.isActive ?? true,
        });
    }

    async updateAdminProduct(
        productId: number,
        input: {
            name?: string;
            slug?: string;
            description?: string | null;
            priceCents?: number;
            imageUrl?: string | null;
            imageStorageKey?: string | null;
            isActive?: boolean;
        }
    ) {
        const product = await this.repository.updateById(productId, input);

        if (!product) {
            throw new NotFoundError("Shop product not found");
        }

        return product;
    }

    async updateAdminProductStatus(productId: number, isActive: boolean) {
        const product = await this.repository.updateStatus(productId, isActive);

        if (!product) {
            throw new NotFoundError("Shop product not found");
        }

        return product;
    }

    async uploadAdminProductImage(file?: Express.Multer.File) {
        if (!file) {
            throw new BadRequestError("Image file is required");
        }

        const extension = this.getImageExtension(file.mimetype);

        const uploadDirectory = path.resolve(
            process.cwd(),
            "uploads",
            "shop-products"
        );

        await fs.mkdir(uploadDirectory, { recursive: true });

        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = path.join(uploadDirectory, fileName);

        await fs.writeFile(filePath, file.buffer);

        const relativeUrl = `/uploads/shop-products/${fileName}`;
        const publicUrl = `${relativeUrl}`;

        return {
            url: publicUrl,
            storageKey: `shop-products/${fileName}`,
        };
    }

    async getAdminProductVariants(productId: number): Promise<ShopProductVariant[]> {
        const variants = await this.repository.findAllVariantsByProductId(productId);

        return variants.map((variant) => this.toVariant(variant));
    }

    async createAdminProductVariant(
        productId: number,
        input: {
            sizeLabel: string;
            colorName: string;
            colorHex?: string | null;
            sku?: string | null;
            priceCents?: number | null;
            stockQuantity: number;
            imageUrl?: string | null;
            imageStorageKey?: string | null;
            isActive?: boolean;
        }
    ): Promise<ShopProductVariant> {
        const variant = await this.repository.createVariant(productId, input);

        return this.toVariant(variant);
    }

    async updateAdminProductVariant(
        productId: number,
        variantId: number,
        input: {
            sizeLabel?: string;
            colorName?: string;
            colorHex?: string | null;
            sku?: string | null;
            priceCents?: number | null;
            stockQuantity?: number;
            imageUrl?: string | null;
            imageStorageKey?: string | null;
            isActive?: boolean;
        }
    ): Promise<ShopProductVariant> {
        const variant = await this.repository.updateVariantById(productId, variantId, input);

        if (!variant) {
            throw new NotFoundError("Shop product variant not found");
        }

        return this.toVariant(variant);
    }

    async updateAdminProductVariantStatus(productId: number, variantId: number, isActive: boolean): Promise<ShopProductVariant> {
        const variant = await this.repository.updateVariantStatus(
            productId,
            variantId,
            isActive
        );

        if (!variant) {
            throw new NotFoundError("Shop product variant not found");
        }

        return this.toVariant(variant);
    }

    async getAdminProductImages(productId: number): Promise<ShopProductImage[]> {
        const images = await this.repository.findAllImagesByProductId(productId);

        return images.map((image) => this.toImage(image));
    }

    async createAdminProductImage(
        productId: number,
        input: {
            imageUrl: string;
            imageStorageKey?: string | null;
            altText?: string | null;
            displayOrder?: number;
            isActive?: boolean;
        }
    ): Promise<ShopProductImage> {
        const image = await this.repository.createImage(productId, input);

        return this.toImage(image);
    }

    async updateAdminProductImage(
        productId: number,
        imageId: number,
        input: {
            imageUrl?: string;
            imageStorageKey?: string | null;
            altText?: string | null;
            displayOrder?: number;
            isActive?: boolean;
        }
    ): Promise<ShopProductImage> {
        const image = await this.repository.updateImageById(
            productId,
            imageId,
            input
        );

        if (!image) {
            throw new NotFoundError("Shop product image not found");
        }

        return this.toImage(image);
    }

    async updateAdminProductImageStatus(productId: number, imageId: number, isActive: boolean): Promise<ShopProductImage> {
        const image = await this.repository.updateImageStatus(
            productId,
            imageId,
            isActive
        );

        if (!image) {
            throw new NotFoundError("Shop product image not found");
        }

        return this.toImage(image);
    }

    //#region private methods
    private getImageExtension(mimeType: string): string {
        if (mimeType === "image/png") {
            return "png";
        }

        if (mimeType === "image/jpeg") {
            return "jpg";
        }

        if (mimeType === "image/webp") {
            return "webp";
        }

        throw new BadRequestError("Unsupported image format");
    }

    private toVariant(variant: ShopProductVariantRow): ShopProductVariant {
        return {
            id: variant.id,
            shopProductId: variant.shop_product_id,
            sizeLabel: variant.size_label,
            colorName: variant.color_name,
            colorHex: variant.color_hex,
            sku: variant.sku,
            priceCents: variant.price_cents,
            stockQuantity: variant.stock_quantity,
            imageUrl: variant.image_url,
            imageStorageKey: variant.image_storage_key,
            isActive: variant.is_active,
            createdAt: variant.created_at,
            updatedAt: variant.updated_at,
        };
    }

    private toImage(image: ShopProductImageRow): ShopProductImage {
        return {
            id: image.id,
            shopProductId: image.shop_product_id,
            imageUrl: image.image_url,
            imageStorageKey: image.image_storage_key,
            altText: image.alt_text,
            displayOrder: image.display_order,
            isActive: image.is_active,
            createdAt: image.created_at,
            updatedAt: image.updated_at,
        };
    }

    //#endregion

}