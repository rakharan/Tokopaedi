
# Tokopaedi

Tokopaedi is a robust backend project designed with a focus on efficiency and scalability. It leverages several powerful technologies including Fastify, TypeScript, and TypeORM to ensure a high-performance, reliable, and maintainable system.


## Run Locally

Clone the project

```bash
  git clone https://github.com/RakhaTF/Tokopaedi.git
```

Go to the project directory

```bash
  cd tokopaedi
```

Install dependencies

```bash
  npm ci
```

Start the server

```bash
  npm run dev
```


## API Reference

#### Healthcheck API
```
localhost:8080/health

{
    "statusCode": 200,
    "status": "ok",
    "uptime": 137.317913
}
```

For list of api, go to:
```
localhost:8080/documentation/
```
Or, if you prefer postman, go to:
```
https://documenter.getpostman.com/view/28871141/2s9YkrazBH
```


## Running Tests

To run tests, run the following command

### Run with coverage
```bash
  npm run test:coverage
```

### Run with ui (coverage included)
```bash
  npm run test:ui
```


## Running in docker

See `docker-command.md` for ways to get started.