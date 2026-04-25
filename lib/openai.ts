import OpenAI from "openai";

// ── OpenAI client (singleton) ──────────────────────────────────────────────
let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ── Chunk text into overlapping segments ──────────────────────────────────
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 50
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 50) {
      // Skip very short chunks
      chunks.push(chunk.trim());
    }
    if (i + chunkSize >= words.length) break;
  }

  return chunks;
}

// ── Generate embeddings for an array of text chunks ───────────────────────
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const openai = getOpenAIClient();

  // Batch into groups of 100 (OpenAI limit)
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });
    allEmbeddings.push(...response.data.map((d) => d.embedding));
  }

  return allEmbeddings;
}

// ── Compute cosine similarity between two vectors ─────────────────────────
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Find top-k relevant chunks via cosine similarity ─────────────────────
export function findRelevantChunks(
  queryEmbedding: number[],
  chunks: Array<{ content: string; embedding: string | null }>,
  topK = 5
): string[] {
  const scored = chunks
    .filter((c) => c.embedding !== null)
    .map((c) => {
      const embedding = JSON.parse(c.embedding!) as number[];
      return {
        content: c.content,
        score: cosineSimilarity(queryEmbedding, embedding),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map((s) => s.content);
}

// ── Summarise long text using GPT ─────────────────────────────────────────
export async function summariseText(text: string): Promise<string> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a content summariser. Extract key facts, FAQs, product info, and support-relevant information from the provided website content. Be concise and factual.",
      },
      {
        role: "user",
        content: `Summarise the following content for a customer support knowledge base:\n\n${text.slice(0, 8000)}`,
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0].message.content ?? text;
}
