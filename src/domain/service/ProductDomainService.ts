import ProductRepository from "@adapters/outbound/repository/ProductRepository"
import { Product } from "@domain/model/BaseClass/Product"
import { ApiError, BadInputError, ResultNotFoundError } from "@domain/model/Error/Error"
import { ProductParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"
import { QueryRunner } from "typeorm"

export default class ProductDomainService {
    static async GetProductListDomain(params: RepoPaginationParams) {
        const productList = await ProductRepository.DBGetProductList(params)
        if (productList.length < 1) {
            throw new ResultNotFoundError("Product is empty!")
        }
        return productList
    }

    static async GetProductDetailDomain(id: number) {
        const productDetail = await ProductRepository.DBGetProductDetail(id)
        if (productDetail.length < 1) {
            throw new ResultNotFoundError("Product not found!")
        }
        return productDetail[0]
    }

    static async SoftDeleteProductDomain(id: number, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const deleteProduct = await ProductRepository.DBSoftDeleteProduct(id, query_runner)
        if (deleteProduct.affectedRows < 1) {
            throw new ApiError("Delete Failed")
        }
    }

    static async CreateProductDomain(product: ProductParamsDto.CreateProductParams, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const newProduct = await ProductRepository.DBCreateProduct(product, query_runner)
        if (newProduct.affectedRows < 1) {
            throw new ApiError("Create Product Failed!")
        }
    }

    static async UpdateProductDomain(product: ProductParamsDto.UpdateProductParams, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const newProduct = await ProductRepository.DBUpdateProduct(product, query_runner)
        if (newProduct.affectedRows < 1) {
            throw new ApiError("Update Product Failed!")
        }
        return newProduct
    }

    static async GetProductsPricesAndStockDomain(ids: number[]) {
        const products: Product[] = []
        for (const id of ids) {
            const product = await ProductRepository.DBGetProductDetail(id)
            if (product.length > 0) {
                products.push({
                    id: product[0].id,
                    name: product[0].name,
                    price: product[0].price,
                    stock: product[0].stock,
                    description: product[0].description,
                    img_src: product[0].img_src,
                    public_id: product[0].public_id,
                })
            }
        }
        if (products.length < 1) {
            throw new ResultNotFoundError(`Product not found`)
        }
        return products
    }

    static async CheckIsProductAliveDomain(id: number) {
        const isAlive = await ProductRepository.DBCheckIsProductAlive(id)
        if (isAlive.length < 1) {
            throw new BadInputError("Product is deleted")
        }
        return true
    }

    static async CheckLowStockProductDomain() {
        return await ProductRepository.DBGetLowStockProduct()
    }

    static async HardDeleteProductDomain(id: number) {
        const deleteProduct = await ProductRepository.DBHardDeleteProduct(id)
        if (deleteProduct.affectedRows < 1) {
            throw new ApiError("FAILED_DELETE_PRODUCT")
        }
    }

    static async GetProductReviewListDomain(id: number, params: RepoPaginationParams) {
        const reviewList = await ProductRepository.GetReviewList(id, params)
        if (reviewList.length < 1) {
            throw new ResultNotFoundError("NO_REVIEW_FOUND")
        }
        return reviewList
    }

    static async CreateProductReviewDomain(params: ProductParamsDto.CreateProductReviewParams, query_runner: QueryRunner) {
        const createReview = await ProductRepository.CreateProductReview(params, query_runner)
        if (createReview.affectedRows < 1) {
            throw new BadInputError("FAILED_TO_CREATE_A_REVIEW")
        }
    }

    static async GetProductReviewDetailDomain(id: number) {
        const reviewDetail = await ProductRepository.GetProductReviewDetail(id)
        if (reviewDetail.length < 1) {
            throw new BadInputError("PRODUCT_REVIEW_NOT_FOUND")
        }
        return reviewDetail[0]
    }

    static async DeleteProductReviewDomain(id: number, query_runner: QueryRunner) {
        const deleteReview = await ProductRepository.DeleteProductReview(id, query_runner)
        if (deleteReview.affectedRows < 1) {
            throw new ApiError("FAILED_TO_DELETE_REVIEW")
        }
    }

    static async CheckExistingReviewDomain(product_id: number, user_id: number) {
        const existingReview = await ProductRepository.CheckExistingReview(user_id, product_id)
        if (existingReview.length > 0) {
            throw new BadInputError("YOU_ALREADY_REVIEWED_THIS_PRODUCT")
        }
    }

    static async CheckReviewOwnershipDomain(review_id: number, user_id: number) {
        const review = await ProductRepository.CheckReviewOwnership(review_id)
        if (review[0].user_id !== user_id) {
            throw new BadInputError("THIS_REVIEW_DOES_NOT_BELONG_TO_YOU")
        }
    }
}