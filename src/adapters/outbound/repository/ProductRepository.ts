import { ProductParamsDto } from "@domain/model/params"
import { ProductResponseDto } from "@domain/model/response"
import { AppDataSource } from "@infrastructure/mysql/connection"
import { RepoPaginationParams } from "key-pagination-sql"
import { ResultSetHeader } from "mysql2"
import { QueryRunner } from "typeorm"

const db = AppDataSource

export default class ProductRepository {
    static async DBGetProductList(params: RepoPaginationParams) {
        const { limit, sort, whereClause } = params
        return await db.query<ProductResponseDto.ProductListResponse>(
            `
        SELECT p.id, p.name, p.description, p.price, p.stock, AVG(pr.rating) as rating, p.public_id, p.img_src
        FROM product p
        JOIN product_review pr
            ON p.id = pr.product_id 
        ${whereClause}
        AND p.is_deleted <> 1
        GROUP BY p.id
        ${sort}
        LIMIT ?`,
            [limit + 1]
        )
    }

    static async DBGetProductDetail(id: number, query_runner?: QueryRunner) {
        return await db.query<ProductResponseDto.ProductDetailResponse[]>(`
        SELECT p.id, p.name, p.description, p.price, p.stock, AVG(pr.rating) as rating, p.public_id, p.img_src 
        FROM product p
            JOIN product_review pr
            ON p.id = pr.product_id 
        WHERE p.id = ?`, [id], query_runner)
    }

    static async DBSoftDeleteProduct(id: number, query_runner?: QueryRunner) {
        return await db.query<ResultSetHeader>(`UPDATE product SET is_deleted = 1 WHERE id = ?`, [id], query_runner)
    }

    static async DBCreateProduct(product: ProductParamsDto.CreateProductParams, query_runner?: QueryRunner) {
        const { name, description, price, stock, img_src, public_id } = product
        return await db.query<ResultSetHeader>(`INSERT INTO product(name, description, price, stock, img_src, public_id) VALUES(?, ?, ?, ?, ?, ?)`, [name, description, price, stock, img_src, public_id], query_runner)
    }

    static async DBUpdateProduct(product: ProductParamsDto.UpdateProductParams, query_runner?: QueryRunner) {
        const { id, name, description, price, stock, img_src, public_id } = product
        return await db.query<ResultSetHeader>(`UPDATE product SET name = ?, description = ?, price = ?, stock = ?, img_src = ?, public_id = ? WHERE id = ?`, [name, description, price, stock, img_src, public_id, id], query_runner)
    }

    static async DBCheckIsProductAlive(id: number) {
        return await db.query<{ id: number }[]>(`SELECT p.id FROM product p WHERE p.id = ? AND p.is_deleted <> 1`, [id])
    }

    static async DBGetLowStockProduct() {
        return await db.query<{ name: string; stock: number }[]>(`SELECT p.name, p.stock FROM product p WHERE p.stock <= 10`)
    }

    static async DBHardDeleteProduct(id: number) {
        return await db.query(`DELETE FROM product WHERE id = ?`, [id])
    }

    static async GetReviewList(id: number, params: RepoPaginationParams) {
        const { limit, sort, whereClause } = params

        return await db.query(`
            SELECT pr.id, pr.user_id, u.name, pr.product_id, pr.rating, pr.comment, pr.created_at
            FROM product_review pr
            JOIN user u
                ON pr.user_id = u.id
            ${whereClause} AND pr.product_id = ?
            ORDER BY pr.rating ${sort}
            LIMIT ?
        `, [id, limit + 1])
    }

    static async CreateProductReview(params: ProductParamsDto.CreateProductReviewParams, query_runner: QueryRunner) {
        const { comment, product_id, rating, user_id, created_at } = params

        return await db.query<ResultSetHeader>(`
            INSERT INTO product_review(user_id, product_id, rating, comment, created_at)
            VALUES(?, ?, ?, ?, ?)
        `, [user_id, product_id, rating, comment, created_at], query_runner)
    }

    static async GetProductReviewDetail(id: number): Promise<ProductResponseDto.ProductReviewDetailResponse[]> {
        return await db.query(`
        SELECT pr.id, pr.user_id, u.name, pr.product_id, pr.rating, pr.comment, pr.created_at
        FROM product_review pr
            JOIN user u
                ON pr.user_id = u.id
        WHERE pr.id = ?
        `, [id])
    }

    static async DeleteProductReview(id: number, query_runner: QueryRunner) {
        return await db.query<ResultSetHeader>(`DELETE FROM product_review WHERE id = ?`, [id], query_runner)
    }

    static async CheckExistingReview(user_id: number, product_id: number) {
        return await db.query<{ id: number, user_id: number }[]>(`SELECT id, user_id FROM product_review WHERE product_id = ? AND user_id = ?`, [product_id, user_id])
    }

    static async CheckReviewOwnership(review_id: number) {
        return await db.query<{ id: number, user_id: number }[]>(`SELECT id, user_id FROM product_review WHERE id = ?`, [review_id])
    }
}