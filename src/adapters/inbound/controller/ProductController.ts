import ProductAppService from "@application/service/Product"
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request"
import { FastifyRequest } from "fastify"
import { FastifyInstance } from "fastify/types/instance"
import { FastifyReply } from "fastify/types/reply"
import fs from "fs"
import { GetProductListRequest, GetProductListResponse, RatingSortOption, SortFilterOption } from "generated_grpc/product_catalog"
import { ProductCatalogServiceClient } from "generated_grpc/product_catalog.grpc-client"
import moment from "moment"
import * as grpc from '@grpc/grpc-js'; // For gRPC status codes
import { promisify } from "util"

// If your DTOs are truly separate, you might need to import them like this:
// import { ProductRequestDto } from '@domain/model/request'; // Adjust if your DTOs are here
// import { CommonRequestDto } from '@domain/model/request'; // Adjust if your DTOs are here
// For now, I'll use inline interfaces for clarity of the request body structure
// that your Fastify route expects. Adjust as needed to your actual DTOs.

// --- Helper Types for Mapping (Adjust these to match your actual DTOs) ---
// This interface represents the structure of the request.body your Fastify route receives.
// It combines elements from your original ProductRequestDto.GetProductListRequest
// and CommonRequestDto.PaginationRequest.
interface FastifyProductListRequestBody {
    // These fields come from CommonRequestDto.PaginationRequest
    limit?: number;
    sort?: string; // "ASC" | "DESC"
    lastId?: number;
    lastPrice?: number; // From your pagination logic
    lastRating?: number; // From your pagination logic

    // These fields come from ProductRequestDto.GetProductListRequest (or similar)
    search?: { // Your original controller used `request.body as ProductRequestDto.GetProductListRequest`
        name?: string;
        // Add other search fields if they exist in your DTO
    };
    // The `additional_body` from your schema is now directly on the top-level
    sortFilter?: "mostReviewed" | "highestPrice" | "lowestPrice" | "lowestRating" | "highestRating"; // String enum
    categoriesFilter?: string;
    ratingSort?: "greaterThanOrEqualFour" | "greaterThanOrEqualThree" | "greaterThanOrEqualTwo"; // String enum
    priceMin?: number;
    priceMax?: number;
}

// --- DTO Mapping Function (Fastify HTTP Request Body to gRPC Request) ---
// This is critical for converting the incoming HTTP request data into the gRPC message format.
function mapFastifyRequestToGrpcRequest(body: FastifyProductListRequestBody): GetProductListRequest {
    // Helper to safely map string input to a generated enum number
    // This handles cases where input is empty, null, undefined, or doesn't match an enum member.
    const getEnumValue = <T extends Record<string, any>>(
        enumObject: T,
        inputValue: string | undefined | null,
        defaultValue: T[keyof T]
    ): T[keyof T] => {
        if (typeof inputValue === 'string' && inputValue.trim() !== '') {
            const upperCaseValue = inputValue.trim().toUpperCase();
            // Check if the uppercase string exists as a key in the enum object
            if (upperCaseValue in enumObject) {
                return enumObject[upperCaseValue];
            }
        }
        return defaultValue; // Return the default if input is invalid or empty
    };

    return {
        pagination: {
            limit: body.limit ?? 0,
            sort: body.sort ?? "ASC",
            lastId: body.lastId ?? 0,
            // --- FIX: Ensure lastPrice and lastRating are numbers, not strings or undefined ---
            // If these are int32/double in proto, they MUST be numbers.
            lastPrice: Number(body.lastPrice) ?? 0, // Convert string "120" to 120
            lastRating: Number(body.lastRating) ?? 0, // Convert string to number
            // --- END FIX ---
        },
        searchFilter: {
            name: body.search?.name ?? "",
            singleCategory: body.search?.name ?? "",
        },
        // --- FIX: Use the robust helper for enum mapping ---
        sortFilter: getEnumValue(SortFilterOption, body.sortFilter, SortFilterOption.SORT_FILTER_UNSPECIFIED),
        categoriesFilter: body.categoriesFilter ?? "",
        ratingSort: getEnumValue(RatingSortOption, body.ratingSort, RatingSortOption.RATING_SORT_UNSPECIFIED),
        // --- END FIX ---
        priceMin: body.priceMin ?? 0,
        priceMax: body.priceMax ?? 0,
    };
}


// --- DTO Mapping Function (gRPC Response to Fastify HTTP Response) ---
// This converts the gRPC response (from your internal service) back into the format
// your Fastify's HTTP response schema expects.
function mapGrpcResponseToHttpResponse(grpcResponse: GetProductListResponse): any {
    // Assuming your Fastify response expects a `data` array directly with mapped products
    // and pagination metadata. Adjust this structure to match your `BasePaginationResultSchema`.
    const mappedProducts = grpcResponse.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stockQuantity, // Map protobuf's camelCase to your DTO's snake_case/preferred case
        category: p.category,
        rating: p.rating,
        review_count: p.reviewCount,
        img_src: p.imageUrls ? p.imageUrls.join(',') : '', // Convert array back to comma-separated string
        public_id: p.publicIds ? p.publicIds.join(',') : '' // Convert array back to comma-separated string
    }));

    return {
        data: mappedProducts,
        nextId: grpcResponse.nextPageToken ? Number(grpcResponse.nextPageToken) : null, // Convert string back to number
        hasNext: grpcResponse.hasMore,
        totalCount: grpcResponse.totalCount, // Assuming this is now included
    };
}


export default class ProductController {
    static async GetProductListGRPC(request: FastifyRequest, reply: FastifyReply) {

        const fastify = request.server as FastifyInstance & { productCatalogGrpcClient: ProductCatalogServiceClient };
        // Access the Fastify instance to get the decorated gRPC client (which is a Promise)
        // --- FIX: Explicitly get the client and ensure its type ---
        // Access the Fastify instance's decorated client (which is a Promise<ProductCatalogServiceClient>)
        const grpcClientPromise = (request.server as FastifyInstance & { productCatalogGrpcClient: Promise<ProductCatalogServiceClient> }).productCatalogGrpcClient;
        // Await the promise to get the actual client instance
        const productCatalogGrpcClient = await grpcClientPromise;
        // --- END FIX ---
        try {
            const requestBody = request.body as FastifyProductListRequestBody;
            const grpcRequest = mapFastifyRequestToGrpcRequest(requestBody);

            console.log('Outgoing gRPC Request:', grpcRequest);
            // --- FIX: Use promisify for cleaner async/await ---
            const getProductListAsync = promisify(productCatalogGrpcClient.getProductList.bind(productCatalogGrpcClient));
            const grpcResponse: GetProductListResponse = await getProductListAsync(grpcRequest);
            // --- END FIX ---

            const httpResponse = mapGrpcResponseToHttpResponse(grpcResponse);
            return { message: httpResponse };
        } catch (error: any) {
            // --- Error Handling from gRPC Calls ---
            // Log the full error object for debugging
            fastify.log.error('Error calling internal gRPC ProductCatalogService:', error);

            let httpStatusCode = 500;
            let errorMessage = "Internal server error during product list retrieval.";

            // Map gRPC status codes to appropriate HTTP status codes
            if (error.code === grpc.status.INVALID_ARGUMENT) {
                httpStatusCode = 400;
                errorMessage = error.details || "Invalid input for product list.";
            } else if (error.code === grpc.status.NOT_FOUND) {
                httpStatusCode = 404;
                errorMessage = error.details || "Products not found.";
            } else if (error.code === grpc.status.UNAVAILABLE) {
                httpStatusCode = 503;
                errorMessage = "Internal service unavailable. Please try again later.";
            } else {
                // For unmapped errors, provide a generic message, but ensure you log the full error above
                errorMessage = error.message || errorMessage;
            }

            reply.status(httpStatusCode).send({ message: errorMessage });
        }
    }

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
        const productUpdate = request.body as ProductRequestDto.UpdateProductRequest

        const updateProduct = await ProductAppService.UpdateProduct(productUpdate, {
            user_id: jwt.id,
            action: `Update Product`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: updateProduct }
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
        const createReview = await ProductAppService.CreateReview(
            { ...params, user_id: id, created_at: now },
            {
                user_id: id,
                action: `Create Review #${params.product_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: now,
            }
        )

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

        const deleteReview = await ProductAppService.DeleteReview(id, user.id, user.level, {
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
        const { name, collection_id } = request.body as { name: string; collection_id: number }

        const updateCollection = await ProductAppService.UpdateWishlistCollection(name, collection_id)
        return { message: updateCollection }
    }

    static async DeleteWishlistCollection(request: FastifyRequest) {
        const { collection_id } = request.body as { collection_id: number }

        const deleteCollection = await ProductAppService.DeleteWishlistCollection(collection_id)
        return { message: deleteCollection }
    }

    static async AddProductToWishlist(request: FastifyRequest) {
        const { collection_id, product_id } = request.body as { collection_id: number; product_id: number }

        const wishlistAProduct = await ProductAppService.AddProductToWishlist(collection_id, product_id)
        return { message: wishlistAProduct }
    }

    static async RemoveProductFromWishlist(request: FastifyRequest) {
        const { collection_id, product_id } = request.body as { collection_id: number; product_id: number }

        const removeProduct = await ProductAppService.RemoveProductFromWishlist(collection_id, product_id)
        return { message: removeProduct }
    }

    static async UpdateImageGallery(request: FastifyRequest) {
        const files = request.files
        const params = request.body as ProductRequestDto.UpdateProductImageGalleryRequest
        try {
            const updateImage = await ProductAppService.UpdateImageGallery(params, files)
            return { message: updateImage }
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

    static async AddImageGallery(request: FastifyRequest) {
        const files = request.files
        const params = request.body as ProductRequestDto.AddImageGalleryRequest
        try {
            const addImage = await ProductAppService.AddImageGallery(params, files)
            return { message: addImage }
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

    static async DeleteImageGallery(request: FastifyRequest) {
        const params = request.body as ProductRequestDto.DeleteImageGalleryRequest
        const addImage = await ProductAppService.DeleteImageGallery(params)
        return { message: addImage }
    }

    static async HardDeleteProduct(request: FastifyRequest) {
        const { id } = request.body as { id: number }

        const deleteProduct = await ProductAppService.HardDeleteProduct(id)
        return { message: deleteProduct }
    }
}
