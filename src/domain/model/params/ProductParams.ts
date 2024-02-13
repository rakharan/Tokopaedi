import { CreateProductReviewRequest } from "../request/ProductRequest"

export type CreateProductParams = {
    name?: string
    description?: string
    price?: number
    stock?: number
    img_src: string
    public_id: string
}

export type UpdateProductParams = {
    id: number
    name?: string
    description?: string
    price?: number
    stock?: number
    img_src?: string
    public_id?: string
}

export type CreateProductReviewParams = CreateProductReviewRequest & {
    user_id: number
    created_at: number
}