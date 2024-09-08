import 'dotenv/config'
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts"
import {
    RunnablePassthrough,
    RunnableSequence,
} from "@langchain/core/runnables";
import { redis, redisVectorStore } from './redis-store.js';
import { StringOutputParser } from '@langchain/core/output_parsers';


const openAiChat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 200
})

const prompt = new PromptTemplate({
    template: `
    See the document below and provide a technical summary.
    If you do not find any reply, say that you did not find

    context:
    {context}

    Question:
    {question}
    `
        .trim(),
    inputVariables: ['context', 'question']
})

const chain = RunnableSequence.from([
    {
        context: redisVectorStore.asRetriever(),
        question: new RunnablePassthrough(),
    },
    prompt,
    openAiChat,
    new StringOutputParser(),
]);

async function main() {
    await redis.connect()

    const response = await chain.invoke("What is the methodology performed?")
    console.log({ response });

    await redis.disconnect()
}

main()