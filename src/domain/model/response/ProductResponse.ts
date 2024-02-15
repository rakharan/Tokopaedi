type Product = {
    id: number
    name: string
    description: string
    category_name: string
    category_id: number
    price: number
    stock: number
    rating: number
    review_count: number
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

type ProductCategory = {
    id: number
    name: string
    parent_id: number
    cat_path: string
}

export type ProductDetailResponse = Product
export type ProductListResponse = Product[]
export type ProductReviewListResponse = ProductReview[]
export type ProductReviewDetailResponse = ProductReview
export type ProductCategoryListResponse = ProductCategory[]
export type ProductCategoryDetailResponse = ProductCategory