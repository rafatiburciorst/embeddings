import 'dotenv/config'
import { join } from 'node:path'
import { __dirname } from './utils.js'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TokenTextSplitter } from "langchain/text_splitter";
import { RedisVectorStore } from "@langchain/redis";
import { createClient } from 'redis';
import { OpenAIEmbeddings } from '@langchain/openai';

const pdfUri = join(__dirname, '..', 'report.pdf')

const loader = new PDFLoader(pdfUri, { splitPages: false })

async function load() {
    const docs = await loader.load()

    const splitter = new TokenTextSplitter({
        chunkSize: 600,
        chunkOverlap: 0,
        encodingName: 'cl100k_base'
    })

    const splittedDocuments = await splitter.splitDocuments(docs)

    const redis = createClient({
        url: process.env.REDIS_HOST
    })

    await redis.connect()



    await RedisVectorStore.fromDocuments(
        splittedDocuments,
        new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY
        }),
        {
            indexName: 'reports-lps',
            redisClient: redis,
            keyPrefix: 'lps:'
        }
    )

    await redis.disconnect()
}

load()