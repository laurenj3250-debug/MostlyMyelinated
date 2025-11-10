import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH_SIZE = 100;

/**
 * Generate embeddings for a single text input
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim(),
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts in a batch
 * Automatically chunks into batches of MAX_BATCH_SIZE
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Filter out empty texts
  const validTexts = texts.filter(t => t && t.trim().length > 0);
  if (validTexts.length === 0) {
    return [];
  }

  try {
    // Process in batches
    const embeddings: number[][] = [];

    for (let i = 0; i < validTexts.length; i += MAX_BATCH_SIZE) {
      const batch = validTexts.slice(i, i + MAX_BATCH_SIZE);

      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch.map(t => t.trim()),
      });

      // OpenAI returns embeddings in the same order as input
      embeddings.push(...response.data.map(item => item.embedding));
    }

    return embeddings;
  } catch (error: any) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find the most similar items from a list based on embedding similarity
 */
export function findMostSimilar<T extends { embedding: number[] }>(
  query: number[],
  items: T[],
  topK: number = 10
): Array<T & { similarity: number }> {
  const withSimilarity = items.map(item => ({
    ...item,
    similarity: cosineSimilarity(query, item.embedding),
  }));

  return withSimilarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
