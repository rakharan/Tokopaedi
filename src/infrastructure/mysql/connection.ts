import DotenvFlow from "dotenv-flow"
import path from "path"
import { DataSource } from "typeorm"

DotenvFlow.config({ path: path.resolve(__dirname, `../../../`) })

export const AppDataSource = new DataSource({
    type: (process.env.DB_IDENTIFIER as "mysql") || "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    migrations: process.env.TESTING === "true" ? undefined : [migrationDir()],
    migrationsTableName: "tokopaedi_migration",
    migrationsRun: true,
    timezone: "+07:00",
    logging: process.env.NODE_ENV === "development" || process.env.NODE_ENV === "testing",
    logger: "file",
})

/* v8 ignore start */
function migrationDir() {
    const production = process.env.PRODUCTION

    if (production) {
        return "build/migration/**/*.js"
    } else {
        return "src/migration/**/*.ts"
    }
}
/* v8 ignore end */
