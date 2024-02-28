import DotenvFlow from "dotenv-flow"
import Redis from "ioredis"
import path from "path"

DotenvFlow.config({ path: path.resolve(__dirname, `../../../`) })

export const redisClient = new Redis({ port: 6379 })


redisClient.on('error', (error: Error) => {
    console.log({ error })
})