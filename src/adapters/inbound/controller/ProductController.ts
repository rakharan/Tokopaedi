import ProductAppService from "@application/service/Product"
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request"
import { FastifyRequest } from "fastify"
import fs from "fs"
import moment from "moment"

export default class ProductController {
    static async GetProductList(request: FastifyRequest) {
        const searchFilter = request.body as ProductRequestDto.GetProductListRequest
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const product = await ProductAppService.GetProductList(paginationRequest, searchFilter)
        return { message: product }
    }

    static async GetProductDetail(request: FastifyRequest) {
        const { id } = request.body as { id: number }
        const productDetail = await ProductAppService.GetProductDetail(id)
        return { message: productDetail }
    }

    static async DeleteProduct(request: FastifyRequest) {
        const { id } = request.body as { id: number }
        const user = request.user
        const deleteProduct = await ProductAppService.SoftDeleteProduct(id, {
            user_id: user.id,
            action: `Delete Product #${id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: deleteProduct }
    }

    static async CreateProduct(request: FastifyRequest) {
        const files = request.files
        const newProduct = request.body as ProductRequestDto.CreateProductRequest
        try {
            const jwt = request.user
            const createProduct = await ProductAppService.CreateProduct(newProduct, files, {
                user_id: jwt.id,
                action: "Create Product",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            })
            return { message: createProduct }
        } catch (error) {
            // Delete tmp files when error occured
            for (const file in files) {
                const imagePath = files[file][0].path
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                }
            }
            throw error
        }
    }

    static async UpdateProduct(request: FastifyRequest) {
        const jwt = request.user
        const files = request.files
        try {
            const productUpdate = request.body as ProductRequestDto.UpdateProductRequest
            const updateProduct = await ProductAppService.UpdateProduct(productUpdate, files, {
                user_id: jwt.id,
                action: `Update Product`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            })
            return { message: updateProduct }
        } catch (error) {
            // Delete tmp files when error occured
            for (const file in files) {
                const imagePath = files[file][0].path
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                }
            }
            throw error
        }
    }

    static async ReviewList(request: FastifyRequest) {
        const { id } = request.body as { id: number }
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const reviewList = await ProductAppService.GetReviewList(id, paginationRequest)

        return { message: reviewList }
    }

    static async CreateReview(request: FastifyRequest) {
        const { id } = request.user
        const params = request.body as ProductRequestDto.CreateProductReviewRequest

        const now = moment().unix()
        const createReview = await ProductAppService.CreateReview({ ...params, user_id: id, created_at: now }, {
            user_id: id,
            action: `Create Review #${params.product_id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: now,
        })

        return { message: createReview }
    }

    static async ReviewDetail(request: FastifyRequest) {
        const { id } = request.body as { id: number }

        const reviewDetail = await ProductAppService.ReviewDetail(id)

        return { message: reviewDetail }
    }

    static async DeleteReview(request: FastifyRequest) {
        const user = request.user
        const { id } = request.body as { id: number }
        const deleteReview = await ProductAppService.DeleteReview(id, user.id, {
            user_id: user.id,
            action: `Delete Review #${id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })

        return { message: deleteReview }
    }

    static async CreateCategory(request: FastifyRequest) {
        const user = request.user
        const params = request.body as ProductRequestDto.CreateProductCategoryRequest
        const createCategory = await ProductAppService.CreateProductCategory(params, {
            user_id: user.id,
            action: `Create Category #${params.name}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })

        return { message: createCategory }
    }

    static async CategoryList(request: FastifyRequest) {
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const categoryList = await ProductAppService.CategoryList(paginationRequest)

        return { message: categoryList }
    }

    static async UpdateCategory(request: FastifyRequest) {
        const user = request.user
        const params = request.body as ProductRequestDto.UpdateProductCategoryRequest
        const updateCategory = await ProductAppService.UpdateProductCategory(params, {
            user_id: user.id,
            action: `Update Category #${params.id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })

        return { message: updateCategory }
    }

    static async DeleteCategory(request: FastifyRequest) {
        const user = request.user
        const { id } = request.body as { id: number }
        const deleteCategory = await ProductAppService.DeleteProductCategory(id, {
            user_id: user.id,
            action: `Delete Category #${id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })

        return { message: deleteCategory }
    }

    static async GetWishlistProductList(request: FastifyRequest) {
        const searchFilter = request.body as ProductRequestDto.GetProductListRequest
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest

        const { collection_id } = request.body as { collection_id: number }

        const user = request.user
        const product = await ProductAppService.GetWishlistedProductList(paginationRequest, searchFilter, user.id, collection_id)
        return { message: product }
    }

    static async CreateWishlistCollection(request: FastifyRequest) {
        const { name } = request.body as { name: string }
        const { id: user_id } = request.user

        const createCollection = await ProductAppService.CreateWishlistCollection(name, user_id)
        return { message: createCollection }
    }

    static async UpdateWishlistCollectionName(request: FastifyRequest) {
        const { name, collection_id } = request.body as { name: string, collection_id: number }

        const updateCollection = await ProductAppService.UpdateWishlistCollection(name, collection_id)
        return { message: updateCollection }
    }

    static async DeleteWishlistCollection(request: FastifyRequest) {
        const { collection_id } = request.body as { collection_id: number }

        const deleteCollection = await ProductAppService.DeleteWishlistCollection(collection_id)
        return { message: deleteCollection }
    }

    static async AddProductToWishlist(request: FastifyRequest) {
        const { collection_id, product_id } = request.body as { collection_id: number, product_id: number }

        const wishlistAProduct = await ProductAppService.AddProductToWishlist(collection_id, product_id)
        return { message: wishlistAProduct }
    }

    static async RemoveProductFromWishlist(request: FastifyRequest) {
        const { collection_id, product_id } = request.body as { collection_id: number, product_id: number }

        const removeProduct = await ProductAppService.RemoveProductFromWishlist(collection_id, product_id)
        return { message: removeProduct }
    }
}
