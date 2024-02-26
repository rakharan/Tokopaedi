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
            throw new ResultNotFoundError("PRODUCT_IS_EMPTY")
        }
        return productList
    }

    static async GetProductDetailDomain(id: number, user_id?: number) {
        const productDetail = await ProductRepository.DBGetProductDetail(id, user_id)
        if (productDetail.length < 1) {
            throw new ResultNotFoundError("PRODUCT_NOT_FOUND")
        }
        return productDetail[0]
    }

    static async SoftDeleteProductDomain(id: number, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const deleteProduct = await ProductRepository.DBSoftDeleteProduct(id, query_runner)
        if (deleteProduct.affectedRows < 1) {
            throw new ApiError("FAILED_TO_DELETE_PRODUCT")
        }
    }

    static async CreateProductDomain(product: ProductParamsDto.CreateProductParams, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const newProduct = await ProductRepository.DBCreateProduct(product, query_runner)
        if (newProduct.affectedRows < 1) {
            throw new ApiError("FAILED_TO_CREATE_PRODUCT")
        }
        return newProduct
    }

    static async UpdateProductDomain(product: ProductParamsDto.UpdateProductParams, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const newProduct = await ProductRepository.DBUpdateProduct(product, query_runner)
        if (newProduct.affectedRows < 1) {
            throw new ApiError("FAILED_TO_UPDATE_PRODUCT")
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
                    category_name: product[0].category_name,
                    category_id: product[0].category_id,
                    description: product[0].description,
                    img_src: product[0].img_src,
                    public_id: product[0].public_id,
                })
            }
        }
        if (products.length < 1) {
            throw new ResultNotFoundError(`PRODUCT_NOT_FOUND`)
        }
        return products
    }

    static async CheckIsProductAliveDomain(id: number) {
        const isAlive = await ProductRepository.DBCheckIsProductAlive(id)
        if (isAlive.length < 1) {
            throw new BadInputError("PRODUCT_IS_DELETED")
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

        if (review.length < 1) {
            throw new BadInputError("REVIEW_NOT_FOUND")
        }

        if (review[0].user_id != user_id) {
            throw new BadInputError("THIS_REVIEW_DOES_NOT_BELONG_TO_YOU")
        }
    }

    static async CreateProductCategoryDomain(params: ProductParamsDto.CreateProductCategoryParams, query_runner: QueryRunner) {
        let category;
        // if parent_id is null/0, that means we creating new head category.
        if (params.parent_id == 0 || params.parent_id == null) {
            category = await ProductRepository.CreateNewHeadCategory(params, query_runner)
        } else {
            // if parent_id is a number ( > 0 ), that means we creating new sub category.
            category = await ProductRepository.CreateNewSubCategory(params, query_runner)
        }
        if (category.affectedRows < 1) {
            throw new ApiError("FAILED_TO_CREATE_CATEGORY")
        }
    }

    static async GetProductCategoryListDomain(params: RepoPaginationParams) {
        const categoryList = await ProductRepository.GetCategoryList(params)
        if (categoryList.length < 1) {
            throw new BadInputError("CATEGORY_LIST_IS_EMPTY")
        }
        return categoryList
    }

    static async GetProductCategoryDetailDomain(id: number) {
        const categoryDetail = await ProductRepository.GetCategoryDetail(id)
        if (categoryDetail.length < 1) {
            throw new BadInputError("CATEGORY_DETAIL_NOT_FOUND")
        }
        return categoryDetail[0]
    }

    static async UpdateProductCategoryDomain(params: ProductParamsDto.UpdateProductCategoryParams, query_runner: QueryRunner) {
        const updateCategory = await ProductRepository.UpdateCategory(params, query_runner)
        if (updateCategory.affectedRows < 1) {
            throw new ApiError("FAILED_TO_UPDATE_CATEGORY")
        }
    }

    static async DeleteProductCategoryDomain(id: number, query_runner: QueryRunner) {
        const deleteCategory = await ProductRepository.DeleteCategory(id, query_runner)
        if (deleteCategory.affectedRows < 1) {
            throw new ApiError("FAILED_TO_DELETE_CATEGORY")
        }
    }

    static async CheckExistingCategoryDomain(name: string) {
        const existingCategory = await ProductRepository.CheckExistingCategory(name)
        if (existingCategory.length > 0 && existingCategory[0].name.toLowerCase() === name.toLowerCase()) {
            throw new BadInputError("SAME_CATEGORY_ALREADY_EXISTS")
        }
    }

    static async GetWishlistedProductListDomain(params: RepoPaginationParams) {
        const productList = await ProductRepository.GetWishlistedProductList(params)
        if (productList.length < 1) {
            throw new ResultNotFoundError("WISHLIST_IS_EMPTY")
        }
        return productList
    }

    static async GetWishlistCollectionDomain(user_id: number) {
        const collections = await ProductRepository.GetUserWishlistCollection(user_id)
        if (collections.length < 1) {
            throw new ResultNotFoundError("YOU_HAVE_NO_COLLECTION")
        }
        return collections
    }

    static async CreateWishlistCollectionDomain(name: string, user_id: number) {
        const newCollection = await ProductRepository.CreateWishlistCollection(name, user_id)
        if (newCollection.affectedRows < 1) {
            throw new ApiError("FAILED_TO_CREATE_NEW_COLLECTION")
        }
    }

    static async UpdateWishlistCollectionNameDomain(name: string, collection_id: number) {
        const updateCollection = await ProductRepository.UpdateWishlistCollectionName(collection_id, name)
        if (updateCollection.affectedRows < 1) {
            throw new ApiError("FAILED_TO_UPDATE_COLLECTION_NAME")
        }
    }

    static async DeleteWishlistCollectionDomain(collection_id: number) {
        const deleteCollection = await ProductRepository.DeleteWishlistCollection(collection_id)
        if (deleteCollection.affectedRows < 1) {
            throw new ApiError("FAILED_TO_DELETE_COLLECTION")
        }
    }

    static async AddProductToWishlistDomain(collection_id: number, product_id: number) {
        const addToWishlist = await ProductRepository.AddProductToWishlist(collection_id, product_id)
        if (addToWishlist.affectedRows < 1) {
            throw new ApiError("FAILED_TO_ADD_PRODUCT_TO_WISHLIST")
        }
    }

    static async RemoveProductFromWishlistDomain(collection_id: number, product_id: number) {
        const removeFromWishlist = await ProductRepository.RemoveProductFromWishlist(collection_id, product_id)
        if (removeFromWishlist.affectedRows < 1) {
            throw new ApiError("FAILED_TO_REMOVE_PRODUCT_FROM_WISHLIST")
        }
    }

    static async AddImageProductGalleryDomain(params: ProductParamsDto.AddProductImageGalleryParams, query_runner: QueryRunner) {
        const addImageGallery = await ProductRepository.AddProductImageToGallery(params, query_runner)
        if (addImageGallery.affectedRows < 1) {
            throw new ApiError("FAILED_TO_ADD_IMAGE_TO_GALLERY")
        }
    }

    static async FindProductImageDetailDomain(public_id: string, product_id: number) {
        const updateImage = await ProductRepository.FindProductImageDetail(public_id, product_id)
        if (updateImage.length < 1) {
            throw new ResultNotFoundError("IMAGE_DETAIL_NOT_FOUND")
        }
        return updateImage[0]
    }

    static async DeleteImageProductGalleryDomain(params: ProductParamsDto.DeleteProductImageGalleryParams, query_runner: QueryRunner) {
        const deleteImageGallery = await ProductRepository.DeleteProductImageFromGallery(params, query_runner)
        if (deleteImageGallery.affectedRows < 1) {
            throw new ApiError("FAILED_TO_DELETE_IMAGE_GALLERY")
        }
    }

    static async UpdateImageProductGalleryDomain(params: ProductParamsDto.UpdateProductImageGalleryParams, query_runner: QueryRunner) {
        const updateImageGallery = await ProductRepository.UpdateProductImageGallery(params, query_runner)
        if (updateImageGallery.affectedRows < 1) {
            throw new ApiError("FAILED_TO_UPDATE_IMAGE_GALLERY")
        }
    }
}