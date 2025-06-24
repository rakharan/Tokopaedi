import fastify from "fastify"
import FastifyBaseAddon from "./application/boot/fastify/base"
import FastifyRouteAddon from "@application/boot/fastify/route"
import FastifySwaggerAddon from "@application/boot/fastify/swagger"
import Ajv from "ajv"
import { AppDataSource } from "@infrastructure/mysql/connection"
import cors from '@fastify/cors'

// --- NEW gRPC Imports ---
import { startGrpcServer } from "src/grpc_services/product_catalog_service" // Your gRPC server start function (corrected import name as per previous discussion)
import { getProductCatalogGrpcClient } from "src/grpc_clients/product_catalog_grpc_client" // Your gRPC client getter
import { ProductCatalogServiceClient } from "./generated_grpc/product_catalog.grpc-client" // Explicitly import for type declaration
// --- END NEW gRPC Imports ---


// Ajv file plugin, so fastify could know what is isFile used in multer.
function ajvFilePlugin(ajv: Ajv) {
    return ajv.addKeyword({
        keyword: "isFile",
        compile: (_schema, parent) => {
            // Updates the schema to match the file type
            parent.type = "file"
            parent.format = "binary"
            delete parent.isFile

            return (field /* MultipartFile */) => !!field.file
        },
        error: {
            message: "should be a file",
        },
    })
}

// Add FastifyInstance type extension for decoration
declare module 'fastify' {
    interface FastifyInstance {
        productCatalogGrpcClient: Promise<ProductCatalogServiceClient>;
    }
}

function buildServer() {
    const server = fastify({
        logger: {
            transport: {
                target: "pino-pretty",
            },
        },
        ajv: { plugins: [ajvFilePlugin] },
    })

    server.register(cors, {
        methods: ["PUT", "GET", "POST"],
        allowedHeaders: ['Content-Type', 'Authorization']
    })

    // --- gRPC Integration inside buildServer() ---
    let grpcClientPromise: Promise<ProductCatalogServiceClient> | null = null;

    // 1. Start the internal gRPC server when Fastify is ready
    server.addHook('onReady', async () => {
        try {
            // Start the gRPC server first
            await startGrpcServer();
            server.log.info('Internal gRPC ProductCatalogService started successfully on port %s.', process.env.GRPC_PORT || 50051);
            
            // Add a longer delay to ensure the server is fully ready
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
            
            // Initialize the gRPC client after the server is ready
            grpcClientPromise = getProductCatalogGrpcClient();
            
            // Test the connection
            await grpcClientPromise;
            server.log.info('Internal gRPC ProductCatalogClient connection established successfully.');
            
        } catch (error) {
            server.log.error('Failed to start internal gRPC ProductCatalogService or establish client connection:', error);
            process.exit(1);
        }
    });

    // 2. Decorate Fastify instance with the gRPC client for lazy initialization
    server.decorate('productCatalogGrpcClient', new Promise<ProductCatalogServiceClient>((resolve, reject) => {
        const waitForClient = async () => {
            // Wait until the client promise is available
            while (!grpcClientPromise) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            try {
                const client = await grpcClientPromise;
                resolve(client);
            } catch (error) {
                reject(error);
            }
        };
        waitForClient();
    }));

    // --- END gRPC Integration ---

    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!")
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err)
            throw new Error("Failed to initialize database") // Throw an error if initialization fails
        })

    server.register(FastifyBaseAddon)
    server.register(FastifySwaggerAddon)
    server.register(FastifyRouteAddon)

    return server
}

export default buildServer