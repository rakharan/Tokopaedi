export type CalculateShippingPrice = {
    expedition_name: string
    shipping_address_id: number
}

export type CalculateTotalPrice = {
    items_price: string
    shipping_price: number
}

export type ImageDetail = {
    product_id: number
    img_src: string
    public_id: string
    thumbnail: number
    display_order: number
}
