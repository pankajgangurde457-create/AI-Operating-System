This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## AI Integration Layer

We have implemented the full backend AI services and API routes for the Personal Knowledge Operating System under `/lib/ai/` and `/app/api/`.

### Subsystems Implemented
1. **Ingestion & Preprocessing Pipeline**: Handles page-preserving PDF extraction, image Vision OCR & descriptions, and audio/video Whisper transcriptions. Performs recursive character chunking and embeddings generation with an index cache.
2. **RAG-based Retrieval**: Dynamic multi-tenant scoped searches on Qdrant, featuring term-frequency hybrid boosting, and LLM-based re-ranking.
3. **Context-Aware Memory**: Dual-tier memory featuring short-term session context (retrieved from Supabase) and long-term user facts synthesis (deduplicated via vector search and stored in Qdrant).
4. **Summarization & Revision Notes**: Map-reduce long document summaries and strictly grounded study notes/flashcard generator with Supabase caching.
5. **Streaming Chat Route**: End-to-end context-aware streaming endpoint (`/api/chat`) implementing token budgeting.

For complete developer details, architecture, data flow diagrams, and extension guidelines, see the [AI Integration Layer README](file:///e:/drishti/internship/AI-Operating-System/lib/ai/README.md).

