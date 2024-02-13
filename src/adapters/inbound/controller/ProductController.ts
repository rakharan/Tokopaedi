import ProductAppService from "@application/service/Product"
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request"
import { FastifyRequest } from "fastify"
import fs from "fs"
import moment from "moment"

export default class ProductController {
    static async GetProductList(request: FastifyRequest) {
        const { ratingSort } = request.body as { ratingSort: string }
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const product = await ProductAppService.GetProductList(paginationRequest, ratingSort)
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
}
