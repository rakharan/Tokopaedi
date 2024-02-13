type Product = {
    id: number
    name: string
    description: string
    price: number
    stock: number
    rating: number
    public_id: string
    img_src: string
}

type ProductReview = {
    id: number
    user_id: number
    product_id: number
    rating: number
    comment: string
    created_at: number
}

export type ProductDetailResponse = Product
export type ProductListResponse = Product[]
export type ProductReviewListResponse = ProductReview[]
export type ProductReviewDetailResponse = ProductReview
