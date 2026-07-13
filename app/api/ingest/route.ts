import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "@langchain/pinecone";
import { embeddingsModel } from "@/lib/openai";
import { getPineconeIndex } from "@/lib/pinecone";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Initialize Supabase to get the user ID and track the upload
    const supabase = createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Note: For this demo without real auth, we will skip the user check.
    // In production, uncomment the auth check above.

    // 1. Convert File to Blob and parse it using LangChain PDFLoader
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    const loader = new PDFLoader(blob, {
      splitPages: false,
    });
    const docs = await loader.load();

    // 2. Split the document into smaller semantic chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Add metadata to the chunks so we can trace citations later
    const docsWithMetadata = splitDocs.map((doc, index) => {
      doc.metadata = {
        ...doc.metadata,
        fileName: file.name,
        chunkId: index,
        // userId: user.id
      };
      return doc;
    });

    // 3. Generate embeddings and store them in Pinecone
    const pineconeIndex = getPineconeIndex();
    await PineconeStore.fromDocuments(docsWithMetadata, embeddingsModel, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    // 4. (Optional) Log the memory event into Supabase PostgreSQL
    /*
    await supabase.from("memory_events").insert({
      user_id: user.id,
      title: `Ingested ${file.name}`,
      description: `Parsed ${splitDocs.length} chunks from ${file.name}.`,
      event_type: "ingestion",
    });
    */

    return NextResponse.json({
      success: true,
      message: `Successfully ingested ${file.name} into ${splitDocs.length} chunks.`,
    });

  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
