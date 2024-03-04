import { AddImageGalleryRequest, CreateProductCategoryRequest, CreateProductReviewRequest, GetProductListRequest, UpdateProductCategoryRequest } from "../request/ProductRequest"

export type CreateProductParams = {
    name: string
    description: string
    price: number
    stock: number
    category: number
}

export type UpdateProductParams = {
    id: number
    name?: string
    description?: string
    price?: number
    stock?: number
}

export type AddProductImageGalleryParams = {
    product_id: number
    thumbnail: number // 0 = false, 1 = true. Only one thumbnail per product is allowed.
    display_order: number
    img_src: string
    public_id: string
}

export type DeleteProductImageGalleryParams = {
    product_id: number
    public_id: string
}

export type UpdateProductImageGalleryParams = {
    id?: number
    product_id?: number
    public_id?: string
    img_src?: string
    thumbnail?: number
    display_order?: number
}

export type CreateProductReviewParams = CreateProductReviewRequest & {
    user_id: number
    created_at: number
}

export type CreateProductCategoryParams = CreateProductCategoryRequest & {
    cat_path: string
}

export type UpdateProductCategoryParams = UpdateProductCategoryRequest & {
    cat_path: string
}

export type GetProductListParams = GetProductListRequest

export type AddImageGalleryParams = AddImageGalleryRequest