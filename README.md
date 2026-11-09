# Tokopaedi

A scalable e-commerce REST API built with Fastify, TypeScript, and Hexagonal (Ports & Adapters) architecture. Features automated order processing, Midtrans payment gateway, RajaOngkir shipping calculation, and Redis caching.

## Architecture

Built using Hexagonal Architecture (Ports and Adapters) for clear separation of concerns, testability, and framework independence:

```
src/
├── domain/           # Core enterprise logic, entities, value objects
├── application/      # Use cases and application services
├── adapters/
│   ├── inbound/      # Fastify HTTP controllers, routes, DTOs
│   └── outbound/     # External integrations (Midtrans, RajaOngkir, Cloudinary, Mailer)
├── infrastructure/  # TypeORM entities, MySQL connections, Redis cache, migrations
└── cronJobs/        # Scheduled tasks (abandoned order cleanup, status sync)
```

## Features

- **Authentication & RBAC**: JWT-based auth with bcrypt password hashing and role-based permissions.
- **Product & Inventory**: Categorized catalogs, stock tracking, and Cloudinary media uploads.
- **Keyset Pagination**: Fast, index-backed cursor pagination for high-volume catalogs via `key-pagination-sql`.
- **Payment Gateway**: Midtrans Snap integration with automated webhook handling and signature verification.
- **Shipping Logistics**: RajaOngkir API integration for real-time domestic shipping cost calculation.
- **Caching Layer**: Redis for high-frequency queries, rate-limit state, and session invalidation.
- **Automated Jobs**: Scheduled background tasks via `node-cron` for order status sync and expiry.
- **Security**: Built-in `@fastify/helmet`, CORS controls, profanity filtering, and input validation with Joi/Ajv.
- **Interactive Documentation**: Auto-generated Swagger/OpenAPI docs served directly from the app.

## Tech Stack

- **Runtime**: Node.js 20+, TypeScript
- **Framework**: Fastify 4
- **ORM / Database**: TypeORM, MySQL 8
- **Cache**: Redis via `ioredis`
- **External Services**: Midtrans, RajaOngkir, Cloudinary, Nodemailer
- **Testing**: Vitest with coverage and UI runners

## Quick Start

### 1. Prerequisites

- Node.js 20+
- MySQL 8+
- Redis 7+
- Docker & Docker Compose (optional)

### 2. Clone & Install

```bash
git clone https://github.com/rakharan/Tokopaedi.git
cd Tokopaedi
npm ci
```

### 3. Environment Configuration

```bash
cp .env.example .env
# Fill in your MySQL, Redis, Midtrans, and RajaOngkir credentials
```

### 4. Run Migrations & Start

```bash
# Development mode with hot-reload
npm run dev

# Or using Docker Compose
docker compose -f docker-compose-dev.yml up --build
```

Server boots on `http://localhost:8080`.

## API Documentation

- **Swagger UI**: Visit `http://localhost:8080/documentation/` when running locally.
- **Postman Collection**: [View online documenter](https://documenter.getpostman.com/view/28871141/2s9YkrazBH)
- **Healthcheck**:
  ```http
  GET /health
  ```
  ```json
  {
    "statusCode": 200,
    "status": "ok",
    "uptime": 137.31
  }
  ```

## Running Tests

```bash
# Run unit & integration tests
npm test

# Run with coverage report
npm run test:coverage

# Interactive Vitest UI
npm run test:ui
```

## License

ISC
