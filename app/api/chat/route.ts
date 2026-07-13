import { NextResponse } from "next/server";
import { PineconeStore } from "@langchain/pinecone";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { embeddingsModel, chatModel } from "@/lib/openai";
import { getPineconeIndex } from "@/lib/pinecone";
// import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Initialize Pinecone Vector Store wrapper
    const pineconeIndex = getPineconeIndex();
    const vectorStore = await PineconeStore.fromExistingIndex(embeddingsModel, {
      pineconeIndex,
      // You can add a filter here for multi-tenant isolation, e.g.:
      // filter: { userId: user.id }
    });

    // 1. Retrieve the top 4 most relevant chunks
    const retriever = vectorStore.asRetriever(4);
    
    // 2. Define the RAG Prompt Template
    const systemTemplate = `You are the AI Operating System (Personal Knowledge OS). 
You have access to the user's personal knowledge base.
Answer the user's question based ONLY on the following context retrieved from their uploaded files.
If you don't know the answer based on the context, say so. Do not hallucinate external facts.

Context:
{context}

Question: {input}`;

    const prompt = PromptTemplate.fromTemplate(systemTemplate);

    // 3. Create the document synthesis chain
    const combineDocsChain = await createStuffDocumentsChain({
      llm: chatModel,
      prompt,
      outputParser: new StringOutputParser(),
    });

    // 4. Create the final retrieval chain
    const chain = await createRetrievalChain({
      retriever,
      combineDocsChain,
    });

    // 5. Execute the chain
    const response = await chain.invoke({
      input: message,
    });

    // 6. Map the source citations to return to the frontend
    const citations = response.context.map((doc: any) => ({
      fileName: doc.metadata.fileName,
      contentSnippet: doc.pageContent.substring(0, 100) + "...",
    }));

    return NextResponse.json({
      answer: response.answer,
      citations: citations,
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
