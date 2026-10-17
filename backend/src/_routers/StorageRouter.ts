import type { Env } from '../types';

export async function putVaultBlob(
  key: string,
  data: ArrayBuffer,
  env: Env
): Promise<void> {
  await env.R2_BUCKET.put(`vault/${key}`, data, {
    httpMetadata: { contentType: 'application/octet-stream' }
  });
}

export async function getVaultBlob(
  key: string,
  env: Env
): Promise<ArrayBuffer | null> {
  const object = await env.R2_BUCKET.get(`vault/${key}`);
  if (!object) return null;
  return object.arrayBuffer();
}
