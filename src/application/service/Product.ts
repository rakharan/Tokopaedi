import { Product } from "@domain/model/BaseClass/Product"
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request"
import ProductDomainService from "@domain/service/ProductDomainService"
import * as ProductSchema from "@helpers/JoiSchema/Product"
import * as CommonSchema from "@helpers/JoiSchema/Common"
import unicorn from "format-unicorn/safe"
import { GenerateWhereClause, Paginate } from "key-pagination-sql"
import { LogParamsDto, ProductParamsDto } from "@domain/model/params"
import { AppDataSource } from "@infrastructure/mysql/connection"
import LogDomainService from "@domain/service/LogDomainService"
import { Profanity } from "indonesian-profanity"
import { emailer } from "@infrastructure/mailer/mailer"
import { DeleteImage, UploadImage } from "@helpers/utils/image/imageHelper"
import { File, FilesObject } from "fastify-multer/lib/interfaces"
import { BadInputError } from "@domain/model/Error/Error"
export default class ProductAppService {
    static async GetProductList(params: CommonRequestDto.PaginationRequest, ratingSort: string = "") {
        await CommonSchema.Pagination.validateAsync(params)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = params

        /*
        search filter, to convert filter field into sql string
        e.g: ({name} = "iPhone" AND {price} > 1000) will turn into ((p.name = "iPhone" AND p.price > 1000))
        every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            name: "p.name",
            price: "p.price",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "p", tablePK: "id" })

        let baseSort = `ORDER BY p.id ${sort}`

        // Add ratingSort if user want to sort by lowest/highest rating.
        if (ratingSort === "highest") {
            baseSort = `ORDER BY rating DESC`
        } else if (ratingSort === "lowest") {
            baseSort = `ORDER BY rating ASC`
        }

        const product = await ProductDomainService.GetProductListDomain({ limit: Number(limit), whereClause, sort: baseSort })

        //Generate pagination
        const result = Paginate({ data: product, limit })

        return result
    }

    static async GetProductDetail(id: number) {
        await ProductSchema.ProductId.validateAsync(id)
        return await ProductDomainService.GetProductDetailDomain(id)
    }

    static async SoftDeleteProduct(id: number, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.ProductId.validateAsync(id)

        //additional checking to prevent mutate deleted data.
        await ProductDomainService.CheckIsProductAliveDomain(id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.SoftDeleteProductDomain(id, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async CreateProduct(product: ProductRequestDto.CreateProductRequest, files: FilesObject, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CreateProduct.validateAsync(product)

        //checking if the product name contains bad word.
        if (Profanity.flag(product.name.toLowerCase())) {
            throw new Error("You can't use this name!")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()
        try {
            await query_runner.startTransaction()

            const imageObjects: Partial<File[]> = []

            for (const key in files) {
                if (files && Object.prototype.hasOwnProperty.call(files, key)) {
                    const fileArray = files[key]
                    if (Array.isArray(fileArray) && fileArray.length > 0) {
                        const imageFile = fileArray[0] // Assuming each key in files is an array and you want the first file

                        imageObjects.push({
                            fieldname: imageFile.fieldname,
                            encoding: imageFile.encoding,
                            mimetype: imageFile.mimetype,
                            originalname: imageFile.originalname,
                            filename: imageFile.filename,
                        })
                    }
                }
            }

            //upload image to cloudinary and extract the url & public_id.
            const { secure_url, public_id } = await UploadImage(imageObjects[0])

            //create the product, insert into database.
            await ProductDomainService.CreateProductDomain({ ...product, img_src: secure_url, public_id }, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain({ ...logData, action: `Create Product #${product.name}` }, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateProduct(product: ProductRequestDto.UpdateProductRequest, files: FilesObject, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.UpdateProduct.validateAsync(product)
        const { id, description, name, price, stock } = product

        //additional checking to prevent mutate deleted data.
        await ProductDomainService.CheckIsProductAliveDomain(id)

        const existingProduct = await ProductDomainService.GetProductDetailDomain(id)

        //Can update product partially, not all property is required
        const updateProductData: Partial<Product> = existingProduct

        if (name) {
            //Add name checking, can not use bad words for the product name
            if (Profanity.flag(product.name.toLowerCase())) {
                throw new Error("You can't use this name!")
            }
            updateProductData.name = name
        }

        if (description) updateProductData.description = description
        if (price) updateProductData.price = price
        if (stock) updateProductData.stock = stock

        if (files) {
            for (const key in files) {
                if (Object.prototype.hasOwnProperty.call(files, key)) {
                    const fileArray = files[key]
                    if (Array.isArray(fileArray) && fileArray.length > 0) {
                        const imageFile = fileArray[0] // Assuming each key in files is an array and you want the first file

                        const imageObjects: Partial<File[]> = []

                        imageObjects.push({
                            fieldname: imageFile.fieldname,
                            encoding: imageFile.encoding,
                            mimetype: imageFile.mimetype,
                            originalname: imageFile.originalname,
                            filename: imageFile.filename,
                        })

                        //delete the old image from cloudinary if user passed a new image
                        await DeleteImage(existingProduct.public_id)

                        //upload new image to cloudinary and extract the url & public_id.
                        const { secure_url, public_id } = await UploadImage(imageObjects[0])

                        updateProductData.public_id = public_id
                        updateProductData.img_src = secure_url
                    }
                }
            }
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()
        try {
            await query_runner.startTransaction()

            await ProductDomainService.UpdateProductDomain({ ...updateProductData, id }, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain({ ...logData, action: `Update Product #${id}` }, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async CheckLowStockProduct() {
        const productList = await ProductDomainService.CheckLowStockProductDomain()
        if (productList.length !== 0) {
            const lowStockProduct = productList.map((prod) => ({
                name: prod.name,
                stock: prod.stock,
            }))
            //send email to admin to notify.
            emailer.notifyAdminForLowStockProduct(lowStockProduct)
            return true
        }
    }

    static async GetReviewList(id: number, params: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(params)
        await ProductSchema.ProductId.validateAsync(id)
        const { lastId = 0, limit = 100, search = "", sort = "ASC" } = params

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter: search, sort, tableAlias: "pr", tablePK: "id" })

        const product = await ProductDomainService.GetProductReviewListDomain(id, { limit: Number(limit), whereClause, sort })

        //Generate pagination
        const result = Paginate({ data: product, limit })

        return result
    }

    static async CreateReview(params: ProductParamsDto.CreateProductReviewParams, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CreateReview.validateAsync(params)

        const { comment, user_id, product_id } = params

        // Check if the comment contains bad words.
        if (comment && Profanity.flag(comment)) {
            throw new BadInputError("YOUR_REVIEW_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_COMMENT");
        }

        // Check if user already reviewed the product, will return error if true.
        await ProductDomainService.CheckExistingReviewDomain(product_id, user_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.CreateProductReviewDomain(params, query_runner)

            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async ReviewDetail(id: number) {
        await ProductSchema.ReviewId.validateAsync(id)
        return await ProductDomainService.GetProductReviewDetailDomain(id)
    }

    static async DeleteReview(id: number, user_id: number, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.ReviewId.validateAsync(id)

        // Check if the review ownership, does it belong to the user trying to delete it.
        // will throw an error if the review belongs to someone else.
        await ProductDomainService.CheckReviewOwnershipDomain(id, user_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.DeleteProductReviewDomain(id, query_runner)

            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async CreateProductCategory(params: ProductRequestDto.CreateProductCategoryRequest, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CreateCategory.validateAsync(params)

        const { name, parent_id } = params

        // checking if name is containing bad word
        if (Profanity.flag(name.toLowerCase())) {
            throw new BadInputError("YOUR_CATEGORY_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_CATEGORY_NAME")
        }

        // checking if there's already a category with the same name, if it's true, throw an error.
        await ProductDomainService.CheckExistingCategoryDomain(name)

        let cat_path: string;

        // if parent_id = 0, the cat_path is /0/NEW.id/.
        //  when parent_id = 0, the category is the head category / doesn't have parent category.
        // if parent_id > 0, category is a sub-category.
        if (parent_id === 0) {
            cat_path = "/0/"
        } else {
            // Getting parent cat_path if parent_id > 0
            const parent = await ProductDomainService.GetProductCategoryDetailDomain(parent_id)
            cat_path = parent.cat_path
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.CreateProductCategoryDomain({ ...params, cat_path }, query_runner)

            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async ProductCategoryList(params: CommonRequestDto.PaginationRequest){
        await CommonSchema.Pagination.validateAsync(params)

        const { lastId = 0, limit = 100, search = "", sort = "ASC" } = params

        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            name: "p.name",
            price: "p.price",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "pc", tablePK: "id" })

        const product = await ProductDomainService.GetProductCategoryListDomain({ limit: Number(limit), whereClause, sort })

        //Generate pagination
        const result = Paginate({ data: product, limit })

        return result
    }

    static async UpdateProductCategory(params: ProductParamsDto.UpdateProductCategoryParams, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CreateCategory.validateAsync(params)

        const { id, cat_path, name, parent_id } = params

        // checking if name is containing bad word
        if (name && Profanity.flag(name.toLowerCase())) {
            throw new BadInputError("YOUR_CATEGORY_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_CATEGORY_NAME")
        }

        // fetching existing category
        const existingCategory = await ProductDomainService.GetProductCategoryDetailDomain(id)

        const updateCategory = existingCategory

        if (name) updateCategory.name = name
        if (cat_path) updateCategory.cat_path = cat_path
        if (parent_id) updateCategory.parent_id = parent_id

        // checking if there's already a category with the same name, if it's true, throw an error.
        await ProductDomainService.CheckExistingCategoryDomain(name)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.UpdateProductCategoryDomain(params, query_runner)

            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }
}