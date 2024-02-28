import DotenvFlow from "dotenv-flow"
import Redis from "ioredis"
import path from "path"

DotenvFlow.config({ path: path.resolve(__dirname, `../../../`) })

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
}

export const redisClient = new Redis({ port: redisConfig.port, host: redisConfig.host })


redisClient.on('error', (error: Error) => {
    console.log({ error })
})