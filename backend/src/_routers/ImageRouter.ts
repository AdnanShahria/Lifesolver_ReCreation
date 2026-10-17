import type { Env } from '../types';

export type ImageProvider = 'r2' | 'imgbb';

export interface UploadResult {
  url: string;
  key: string;
  provider: ImageProvider;
}

export async function uploadImage(
  file: ArrayBuffer,
  filename: string,
  mimeType: string,
  env: Env
): Promise<UploadResult> {
  const provider = (env.IMAGE_PROVIDER ?? 'r2') as ImageProvider;

  switch (provider) {
    case 'r2': {
      const key = `uploads/${crypto.randomUUID()}-${filename}`;
      await env.R2_BUCKET.put(key, file, { httpMetadata: { contentType: mimeType } });
      const publicBase = env.R2_PUBLIC_URL || '/cdn';
      return { url: `${publicBase}/${key}`, key, provider: 'r2' };
    }
    default:
      throw new Error(`Unsupported IMAGE_PROVIDER: ${provider}`);
  }
}

export async function deleteImage(key: string, env: Env): Promise<void> {
  await env.R2_BUCKET.delete(key);
}
