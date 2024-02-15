export type CreateProductRequest = {
    name: string
    description: string
    category: number
    price: number
    stock: number
}

export type UpdateProductRequest = {
    id: number
    name?: string
    description?: string
    category?: number
    price?: number
    stock?: number
}

export type CreateProductReviewRequest = {
    product_id: number
    rating: number
    comment: string
}

export type CreateProductCategoryRequest = {
    name: string
    parent_id?: number
}

export type UpdateProductCategoryRequest = {
    id: number
    name?: string
    parent_id?: number
}