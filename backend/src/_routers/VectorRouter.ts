import type { Env } from '../types';

export async function upsertEmbedding(
  id: string,
  values: number[],
  metadata: Record<string, string>,
  env: Env
) {
  return env.VECTORIZE_INDEX.upsert([{ id, values, metadata }]);
}

export async function queryEmbedding(vector: number[], topK: number, env: Env) {
  return env.VECTORIZE_INDEX.query(vector, { topK, returnMetadata: true });
}
