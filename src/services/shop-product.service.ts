import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env.js";
import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { ShopProductRepository } from "../repositories/shop-product.repository.js";

export class ShopProductService {
    constructor(private readonly repository = new ShopProductRepository()) { }

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

    async getAdminProducts() {
        return this.repository.findAllAdmin();
    }

    async createAdminProduct(input: {
        name: string;
        slug: string;
        description?: string | null;
        priceCents: number;
        imageUrl?: string | null;
        isActive?: boolean;
    }) {
        return this.repository.create({
            name: input.name,
            slug: input.slug,
            description: input.description ?? null,
            priceCents: input.priceCents,
            imageUrl: input.imageUrl ?? null,
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

}