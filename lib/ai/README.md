# Personal Knowledge OS - AI Integration Layer

This directory contains the modular, provider-agnostic backend AI services and API routes powering the Personal Knowledge Operating System.

## Directory Structure

```
/lib/ai/
  providers/
    AIProvider.ts        # Chat, vision OCR, & Whisper interfaces
    EmbeddingProvider.ts # Vector embedding generation interface
    openai-provider.ts   # OpenAI concrete implementations (GPT-4o, Whisper, text-embedding-3)
    gemini-provider.ts   # Gemini fallback implementation (stubbed)
    factory.ts           # Factory instantiating providers based on env variables
  qdrant/
    qdrant-client.ts     # Client setup, dynamic collection assert/creation, search helpers
  ingestion/
    chunker.ts           # Built-in RecursiveCharacterTextSplitter and chunk helper
    pdf-helper.ts        # Page-by-page PDF parser utilizing pdf-parse
    pipeline.ts          # Orchestrator routing PDF/Doc, Image, and Audio/Video files
  retrieval/
    rag-retriever.ts     # Qdrant search + Hybrid text boost + LLM-based re-ranking
    qa-service.ts        # Strict single-turn QA runner (hallucination-free)
  memory/
    memory-manager.ts    # Short-term (Supabase) & Long-term facts extraction & deduplication
  summarization/
    summarizer.ts        # Map-reduce document summarization with Supabase cache
  revision/
    revision-generator.ts # Grounded Revision Notes & Q&A flashcards builder
```

---

## Architecture & Data Flows

### Ingestion Flow
```
                       +-------------------+
                       |  File Uploaded    |
                       |  to Storage       |
                       +---------+---------+
                                 |
                                 v
                       +---------+---------+
                       |  POST /api/ingest |
                       +---------+---------+
                                 |
                       (Triggered Async)
                                 |
                                 v
                       +---------+---------+
                       | Ingestion Pipeline|
                       +---------+---------+
                       | 1. Download file  |
                       | 2. Parse by MIME  |
                       | 3. Chunker        |
                       | 4. Cache Check    |
                       | 5. Embed Chunks   |
                       | 6. Upsert Qdrant  |
                       | 7. Log DB Status  |
                       +-------------------+
```

### Chat & Memory Flow
```
                       +--------------------+
                       |  POST /api/chat    |
                       +---------+----------+
                                 |
                                 v
                  +--------------+--------------+
                  |  Retrieve Context & Memory  |
                  +--------------+--------------+
                  | - Query Embedding           |
                  | - Qdrant Vector Search      |
                  | - Keyword/BM25 similarity   |
                  | - LLM Re-ranking (10 -> 5)  |
                  | - Short-term conversation   |
                  | - Long-term facts retrieval |
                  +--------------+--------------+
                                 |
                                 v
                  +--------------+--------------+
                  |    Token Budget Filter      |
                  +--------------+--------------+
                                 |
                                 v
                  +--------------+--------------+
                  |    Stream LLM response      |
                  |    & write to Supabase      |
                  +--------------+--------------+
                                 |
                        (Background job)
                                 |
                                 v
                  +--------------+--------------+
                  | Memory Facts Distillation   |
                  | (extract, deduplicate,      |
                  |  upsert to Qdrant)          |
                  +-----------------------------+
```

---

## Developer Guides

### 1. Swapping LLM/Embedding Providers
All model requests pass through the provider-agnostic interfaces in `/lib/ai/providers/`.
To switch between providers, set the `AI_PROVIDER` environment variable in `.env`:
*   `AI_PROVIDER=openai` (Default)
*   `AI_PROVIDER=gemini`

To implement a new provider (e.g., Anthropic or a local LLM), create a new provider file (e.g., `lib/ai/providers/claude-provider.ts`), implement `AIProvider` and `EmbeddingProvider`, and add it to the instantiation logic in `lib/ai/providers/factory.ts`.

### 2. Extending to a New File Type
To add support for a new file type (e.g., Markdown, EPUB, or CSV):
1.  Open [pipeline.ts](file:///e:/drishti/internship/AI-Operating-System/lib/ai/ingestion/pipeline.ts).
2.  Locate the MIME routing conditional block inside `runIngestionPipeline`.
3.  Add a new parsing condition branch:
    ```typescript
    if (mimeType === "text/markdown") {
      const text = buffer.toString("utf-8");
      // Add custom markdown structure parsing or section headings division if desired
      blocks = [{ text, pageOrTimestamp: "Markdown Content" }];
    }
    ```
4.  Optionally import a specialized extraction package. The pipeline will automatically chunk, embed, cache, and upsert your blocks into Qdrant.

### 3. Running Unit Tests
To execute the test suite validating chunking, snippet highlighting, and prompt budgeting:
```bash
npx tsx tests/ai-integration.test.ts
```
No active database credentials or API keys are required to run this suite, as all external side effects are safely mocked or isolated using lazy loading.
