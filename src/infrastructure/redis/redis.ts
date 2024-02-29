/* v8 ignore start */
import DotenvFlow from "dotenv-flow"
import Redis, { RedisOptions } from "ioredis"
import path from "path"

DotenvFlow.config({ path: path.resolve(__dirname, `../../../`) })

const redisConfig: RedisOptions = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD
}

export const redisClient = new Redis(redisConfig)

redisClient.on('error', (error: Error) => {
    console.log({ error })
})
/* v8 ignore stop */