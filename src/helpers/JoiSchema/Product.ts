import Joi from "joi"
import { UserId } from "./User"

export const ProductId = Joi.number().min(1).required().messages({
    "number.base": "id must be a number",
    "number.min": "id must be greater than or equal to 1",
    "any.required": "id is a required field",
})

export const ReviewId = Joi.number().min(1).required().messages({
    "number.base": "id must be a number",
    "number.min": "id must be greater than or equal to 1",
    "any.required": "id is a required field",
})

export const CollectionId = Joi.number().min(1).required().messages({
    "number.base": "id must be a number",
    "number.min": "id must be greater than or equal to 1",
    "any.required": "id is a required field",
})

export const CategoryId = Joi.number().min(0).messages({
    "number.base": "id must be a number",
    "number.min": "id must be greater than or equal to 0",
    "any.required": "id is a required field",
})

const Price = Joi.number().min(1).messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be greater than or equal to 1",
})

const Description = Joi.string()
    .max(100)
    .pattern(/^[a-zA-Z0-9 _-]*$/)
    .messages({
        "string.base": "Description must be a string",
        "string.max": "Description must be no more than 100 characters long",
    })

const Stock = Joi.number().min(1).messages({
    "number.base": "Stock must be a number",
    "number.min": "Stock must be greater than or equal to 1",
})

const Category = Joi.number().min(0).messages({
    "number.base": "Category must be a number",
    "number.min": "Category must be greater than or equal to 0",
})

const Name = Joi.string().messages({
    "string.base": "Name must be a string",
})

const PublicId = Joi.string().required().messages({
    "string.base": "Public Id must be a string",
    "any.required": "Public Id is required",
})

export const CreateProduct = Joi.object({
    name: Name.required().messages({
        "any.required": "Product name is required",
    }),
    description: Description.required().messages({
        "any.required": "Description is required",
    }),
    price: Price.required().messages({
        "any.required": "Price is required",
    }),
    category: Category.required().messages({
        "any.required": "Category is required",
    }),
    stock: Stock.required().messages({
        "any.required": "Stock is required",
    }),
})
    .options({ abortEarly: false })
    .unknown(true)

export const UpdateProduct = Joi.object({
    id: ProductId,
    name: Name,
    description: Description,
    price: Price,
    category: Category,
    stock: Stock,
}).options({ abortEarly: false })

export const CreateReview = Joi.object({
    product_id: ProductId,
    user_id: UserId,
    rating: Joi.number().min(1).max(5).required().messages({
        "number.base": "Rating must be a number",
        "number.min": "Rating must be greater than or equal to 1",
        "number.max": "Rating must be lower than or equal to 5",
    }),
    comment: Joi.string().optional().messages({
        "string.base": "Comment must be a string",
    }),
})
    .options({ abortEarly: false })
    .unknown(true)

export const CreateCategory = Joi.object({
    name: Name,
    parent_id: CategoryId.required(),
}).options({ abortEarly: false })

export const UpdateCategory = Joi.object({
    id: CategoryId,
    name: Name,
    parent_id: CategoryId,
    cat_path: Joi.string(),
}).options({ abortEarly: false })

export const ProductList = Joi.object({
    sortFilter: Joi.string().valid("mostReviewed", "highestRating", "lowestRating", "lowestPrice", "highestPrice").optional(),
    categoriesFilter: Joi.string().optional(),
    ratingSort: Joi.string().valid("greaterThanOrEqualFour", "greaterThanOrEqualThree", "greaterThanOrEqualTwo").optional(),
    priceMin: Price,
    priceMax: Price,
})
    .options({ abortEarly: false })
    .unknown(true)

export const CreateCollection = Joi.object({
    name: Name.required(),
    user_id: UserId,
})

export const UpdateCollection = Joi.object({
    name: Name.required(),
    collection_id: CollectionId,
})

export const WishlistCollection = UserId

export const AddProductToWishlist = Joi.object({
    collection_id: CollectionId,
    product_id: ProductId,
})

export const RemoveProductFromWishlist = Joi.object({
    collection_id: CollectionId,
    product_id: ProductId,
})

export const DeleteImageGallery = Joi.object({
    product_id: ProductId,
    public_id: PublicId,
})
