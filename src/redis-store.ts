import 'dotenv/config'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RedisVectorStore } from '@langchain/redis'
import { createClient } from 'redis'


export const redis = createClient({
    url: process.env.REDIS_HOST
})

export const redisVectorStore = new RedisVectorStore(
    new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY
    }),
    {
        indexName: 'reports-lps',
        redisClient: redis,
        keyPrefix: 'lps:'
    }
)