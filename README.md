# Personal Knowledge AI Operating System (AI OS)

AI OS is a next-generation, premium, context-aware second brain application built with Next.js, Tailwind CSS, Supabase, OpenAI, and Qdrant. It features page-preserving document ingestion, OCR pipelines, Whisper transcriptions, hybrid search with LLM-based re-ranking, session memory management, and grounded revision note synthesis.

---

## Architecture Overview

AI OS uses a unified, serverless architecture deployed on Vercel with a multi-tenant vector database layout.

```
                           +------------------------+
                           |   Next.js Frontend     |
                           +-----------+------------+
                                       |
                   (API Calls / Form Uploads / Chat Stream)
                                       |
                                       v
                           +------------------------+
                           |  Next.js Server Route  |
                           |   Handlers (Vercel)    |
                           +-----------+------------+
                                       |
        +------------------------------+------------------------------+
        |                              |                              |
        v                              v                              v
+---------------+              +---------------+              +---------------+
|   Supabase    |              | OpenAI API    |              | Qdrant DB     |
|   Database    |              | (GPT-4o-mini  |              | (Multi-tenant |
|   & Storage   |              | / Whisper)    |              | vector search)|
+---------------+              +---------------+              +---------------+
```

### Core Subsystems:
1. **Ingestion & OCR Pipeline**: Supports PDF parsing (page-by-page), image analysis/OCR, and audio/video transcription using OpenAI Whisper. Text is split using a robust semantic splitter.
2. **Cost-Optimized Cache**: Generates 3072-dimension vectors with OpenAI's `text-embedding-3-large`. All embeddings are MD5 hashed and cached in Supabase to eliminate duplicate API costs.
3. **Multi-Tenant Hybrid Search**: Scopes all vector DB searches by `user_id` payload match for strict data isolation. Combines vector cosine similarity with term frequency keyword boosting and an LLM relevance re-ranker.
4. **Structured Memory & Revision Notes**: Uses Map-Reduce to summarize documents. Extracts atomic facts about user preferences and deduplicates them using vector distance thresholds (0.85 cosine similarity) in the timeline.

---

## Installation

### Prerequisites
- **Node.js**: `v18` or higher (`v22` recommended)
- **npm** or similar package manager

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/pankajgangurde457-create/AI-Operating-System.git
   cd AI-Operating-System
   ```
2. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and populate it with your API keys:
   ```bash
   cp .env.example .env.local
   ```

---

## Environment Variables

| Variable Name | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your project's Supabase API endpoint (e.g. `https://xxx.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | The client-side public anon key for Supabase Auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | The server-side service role key (bypasses RLS to manage cache and ingestion). |
| `AI_PROVIDER` | No | Defaults to `openai`. Can be set to `gemini` (stubbed). |
| `OPENAI_API_KEY` | Yes | OpenAI API Key for model calls, embeddings, transcription, and vision OCR. |
| `QDRANT_URL` | Yes | Qdrant client URL (e.g., local `http://localhost:6333` or cloud instance). |
| `QDRANT_API_KEY` | No | The API token for cloud/authenticated Qdrant instances. |

---

## Running Locally

1. **Verify Database Setup**:
   Ensure all tables, RLS policies, and buckets from [supabase_schema.sql](./supabase_schema.sql) are created in your Supabase project dashboard.
2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
3. **Run Unit Tests**:
   To run automated tests verifying chunking, keyword highlight snippets, and token budgeting:
   ```bash
   npx tsx tests/ai-integration.test.ts
   ```

---

## Production Deployment

This project compiles into a fully serverless Next.js bundle and is designed for Vercel.

### Deploying on Vercel
1. Link your GitHub repository in the **Vercel Dashboard**.
2. Configure the **Build Command** (`npm run build`) and **Install Command** (`npm install --legacy-peer-deps`).
3. Add all variables listed in `.env.example` in the **Environment Variables** section.
4. Click **Deploy**. Vercel will build and provision all API routes as serverless edge functions.

---

## Production Notes

- **Multi-Tenant Isolation**: RLS is strictly enforced at the database level using `auth.uid() = user_id`. All vectors stored in Qdrant carry a `user_id` payload attribute which is explicitly matched in query filter arrays.
- **Auto-Initialization**: The Qdrant connection pool lazily checks and provisions `knowledge_chunks` and `long_term_memories` collections and indices automatically on the first search/ingestion query.
- **Streaming fallback**: `/api/chat` supports both chunked `application/x-ndjson` streams (when calling with `stream: true` parameter) and standard JSON fallback responses for native client compatibility.


