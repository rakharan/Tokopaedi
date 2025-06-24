import * as grpc from '@grpc/grpc-js';
import { ProductCatalogServiceClient } from '../../generated_grpc/product_catalog.grpc-client';
let productCatalogGrpcClientInstance: ProductCatalogServiceClient | null = null;

// Ensure the return type is explicitly the generated client class
export async function getProductCatalogGrpcClient(): Promise<ProductCatalogServiceClient> {
    if (!productCatalogGrpcClientInstance) {
        const grpcPort = process.env.GRPC_PORT || 50051;
        const target = `localhost:${grpcPort}`;

        productCatalogGrpcClientInstance = new ProductCatalogServiceClient(
            target,
            grpc.credentials.createInsecure() as any // Cast for now, if still complains about credentials
        );

        await new Promise<void>((resolve, reject) => {
            // Ensure this is the correct method call for protobuf-ts client's wait for ready
            // The `waitForReady` method should be available on the client instance directly.
            // If it complains, it's possible protobuf-ts's GrpcTransport doesn't expose it directly
            // and expects you to rely on the transport's internal connection management.
            // For now, let's assume `waitForReady` is there as per @grpc/grpc-js client.
            // If it still gives error, we might need to remove this waitForReady for protobuf-ts.
            productCatalogGrpcClientInstance!.waitForReady(Date.now() + 5000, (error: Error | undefined) => {
                if (error) {
                    console.error(`gRPC client to ${target} failed to connect:`, error);
                    reject(error);
                } else {
                    console.log(`gRPC client to ${target} is ready.`);
                    resolve();
                }
            });
        });
    }
    return productCatalogGrpcClientInstance;
}

// Re-export generated message types if needed elsewhere
export { GetProductListRequest, GetProductListResponse, Product } from '../../generated_grpc/product_catalog';