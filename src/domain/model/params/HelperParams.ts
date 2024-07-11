export type CalculateShippingPrice = {
    shipping_type: string
    shipping_cost_details: ShippingCostsDetails[]
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

export type ServiceCost = {
    value: number;
    etd: string;
    note: string;
}

export type ShippingCostsDetails = {
    service: string;
    description: string;
    cost: ServiceCost[],
}