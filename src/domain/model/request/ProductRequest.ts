export type CreateProductRequest = {
    name: string
    description: string
    category: number
    price: number
    stock: number
    thumbnail: number
    display_order: number
}

export type UpdateProductRequest = {
    id: number
    name?: string
    description?: string
    category?: number
    price?: number
    stock?: number
}

export type UpdateProductImageGalleryRequest = {
    id: number
    product_id: number
    public_id: string
    img_src?: string
    thumbnail?: number
    display_order?: number
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

export type GetProductListRequest = {
    sortFilter: string
    categoriesFilter: string
    ratingSort: string
    priceMin: number
    priceMax: number
    lastPrice: number
    lastRating: number
}

export type AddImageGalleryRequest = {
    product_id: number
}

export type DeleteImageGalleryRequest = {
    product_id: number
    public_id: string
}
