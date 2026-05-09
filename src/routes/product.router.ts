import { Router } from "express";
import { ProductRepository } from "../repositories/product.repository.js";
import { ProductService } from "../services/product.service.js";
import { ProductController } from "../controllers/product.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";

const productRouter = Router();

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

productRouter.get(
  "/",
  asyncHandler(productController.getCatalog.bind(productController))
);

export default productRouter;