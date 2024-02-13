export type CreateProductRequest = {
    name: string
    description: string
    price: number
    stock: number
}

export type UpdateProductRequest = {
    id: number
    name?: string
    description?: string
    price?: number
    stock?: number
}

export type CreateProductReviewRequest = {
    product_id: number
    rating: number
    comment: string
}