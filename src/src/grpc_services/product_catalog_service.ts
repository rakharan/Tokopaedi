// src/grpc_services/product_catalog_grpc_server.ts
import * as grpc from '@grpc/grpc-js';
import { productCatalogServiceDefinition, IProductCatalogService } from '../../generated_grpc/product_catalog.grpc-server';

// Import the generated types for messages
import { GetProductListRequest, GetProductListResponse, Product, RatingSortOption, SortFilterOption } from '../../generated_grpc/product_catalog'; // Adjust path as necessary

// Import your existing application service and DTOs
import ProductAppService from '@application/service/Product'; // Adjust path
import { CommonRequestDto } from '@domain/model/request'; // Adjust path for your DTOs/interfaces
import { ProductParamsDto } from '@domain/model/params';

// Helper for safe numeric conversion, ensuring it's always a number
const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num; // Default to 0 if NaN
};

function getSortFilterString(enumValue: SortFilterOption | undefined): string | undefined {
  if (enumValue === undefined || enumValue === SortFilterOption.SORT_FILTER_UNSPECIFIED) {
    return undefined; // If unspecified or undefined, send undefined (Joi optional)
  }
  switch (enumValue) {
    case SortFilterOption.MOST_REVIEWED: return "mostReviewed";
    case SortFilterOption.HIGHEST_PRICE: return "highestPrice";
    case SortFilterOption.LOWEST_PRICE: return "lowestPrice";
    case SortFilterOption.LOWEST_RATING: return "lowestRating";
    case SortFilterOption.HIGHEST_RATING: return "highestRating";
    default: return undefined; // Fallback for any unexpected number
  }
}

function getRatingSortString(enumValue: RatingSortOption | undefined): string | undefined {
  if (enumValue === undefined || enumValue === RatingSortOption.RATING_SORT_UNSPECIFIED) {
    return undefined; // If unspecified or undefined, send undefined
  }
  switch (enumValue) {
    case RatingSortOption.GREATER_THAN_OR_EQUAL_FOUR: return "greaterThanOrEqualFour";
    case RatingSortOption.GREATER_THAN_OR_EQUAL_THREE: return "greaterThanOrEqualThree";
    case RatingSortOption.GREATER_THAN_OR_EQUAL_TWO: return "greaterThanOrEqualTwo";
    default: return undefined;
  }
}

// Helper for safe numeric conversion, now also allowing undefined if input is zero
const safeNumberOrUndefined = (value: any): number | undefined => {
  const num = Number(value);
  // If the number is NaN or 0, return undefined. Otherwise, return the number.
  // This allows Joi's .optional() or `min(1)` to work correctly.
  if (isNaN(num) || num === 0) {
    return undefined;
  }
  return num;
};


// You might want to map your internal DTOs to the protobuf-ts generated types
// Example: (similar to what we did before)
function mapGrpcRequestToAppServiceParams(grpcRequest: GetProductListRequest): {
  paginationRequest: CommonRequestDto.PaginationRequest,
  searchFilter: ProductParamsDto.GetProductListParams
} {
  // Call the helpers for string mapping
  const mappedSortFilter = getSortFilterString(grpcRequest.sortFilter);
  const mappedRatingSort = getRatingSortString(grpcRequest.ratingSort);

  // Call the helper for numeric fields that can be optional/zero
  const mappedPriceMin = safeNumberOrUndefined(grpcRequest.priceMin);
  const mappedPriceMax = safeNumberOrUndefined(grpcRequest.priceMax);
  const mappedLastRating = safeNumberOrUndefined(grpcRequest.pagination?.lastRating);
  const mappedLastPrice = safeNumberOrUndefined(grpcRequest.pagination?.lastPrice);


  const pagination: CommonRequestDto.PaginationRequest = {
    limit: grpcRequest.pagination?.limit ?? 100, // Still default to 100 if not provided
    sort: grpcRequest.pagination?.sort ?? "ASC",
    lastId: grpcRequest.pagination?.lastId ?? 0,
    search: grpcRequest.searchFilter?.name ?? "",
  };

  // --- Handling categoriesFilter empty string ---
  // Pass undefined if empty string, so Joi optional/allow('') can work
  const categoriesFilterValue = grpcRequest.categoriesFilter === "" ? undefined : grpcRequest.categoriesFilter;

  const searchFilter: ProductParamsDto.GetProductListParams = {
    categoriesFilter: categoriesFilterValue, // Use handled value
    ratingSort: mappedRatingSort, // Use mapped string
    sortFilter: mappedSortFilter, // Use mapped string
    priceMax: mappedPriceMax, // Now undefined if 0
    priceMin: mappedPriceMin,
    lastPrice: mappedLastPrice,
    lastRating: mappedLastRating
  };
  return { paginationRequest: pagination, searchFilter: searchFilter };
}

function mapProductToGrpcProduct(product: any): Product {
  return {
    id: product.id?.toString(),
    name: product.name,
    description: product.description,
    price: safeNumber(product.price), // Apply safeNumber
    stockQuantity: safeNumber(product.stock), // Use 'product.stock' as per your repository output, apply safeNumber
    category: product.category,
    rating: safeNumber(product.rating), // Apply safeNumber
    reviewCount: safeNumber(product.review_count), // Apply safeNumber
    imageUrls: product.img_src ? product.img_src.split(',') : [],
    publicIds: product.public_id ? product.public_id.split(',') : []
  };
}


// This is the actual gRPC server implementation object
export const productCatalogGrpcService: IProductCatalogService = {
  getProductList: async (call, callback) => {
    try {
      const { paginationRequest, searchFilter } = mapGrpcRequestToAppServiceParams(call.request);
      const result = await ProductAppService.GetProductList(paginationRequest, searchFilter);

      const grpcProducts = result.data.map(mapProductToGrpcProduct);
      const response: GetProductListResponse = {
        products: grpcProducts,
        nextPageToken: result.lastId ? String(result.lastId) : '',
        hasMore: result.hasNext,
        totalCount: safeNumber(result.data.length) // Apply safeNumber here
      };

      callback(null, response);
    } catch (error: any) {
      console.error("Error in GetProductList gRPC service:", error);
      let status = grpc.status.INTERNAL;
      if (error.name === "BadInputError") status = grpc.status.INVALID_ARGUMENT;
      else if (error.name === "ResultNotFoundError") status = grpc.status.NOT_FOUND;

      callback({ code: status, message: error.message });
    }
  },
};

// Function to start the gRPC server
export function startGrpcServer() {
  const server = new grpc.Server();
  // Use the correctly imported service definition constant
  server.addService(productCatalogServiceDefinition, productCatalogGrpcService); // <-- CORRECTED LINE

  const port = process.env.GRPC_PORT || 50051;
  return new Promise<void>((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          return reject(err);
        }
        server.start();
        console.log(`Internal gRPC server running on port ${port}`);
        resolve();
      }
    );
  });
}