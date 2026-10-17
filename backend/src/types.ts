import type { D1Database, KVNamespace, R2Bucket, Queue, VectorizeIndex, Ai } from '@cloudflare/workers-types';

export interface Env {
  ENVIRONMENT: string;
  DB: D1Database;
  KV: KVNamespace;
  R2_BUCKET: R2Bucket;
  AI: Ai;
  VECTORIZE_INDEX: VectorizeIndex;
  NOTIFICATION_QUEUE: Queue;

  // Provider Selection
  DB_PRIMARY?: string;
  DB_REPLICA?: string;
  AI_PROVIDER?: string;
  AI_FALLBACK?: string;
  IMAGE_PROVIDER?: string;
  EMAIL_PROVIDER?: string;
  VECTOR_PROVIDER?: string;
  PAYMENT_PROVIDER?: string;

  // Secrets
  JWT_SECRET: string;
  ADMIN_SESSION_SECRET: string;
  GROQ_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  HUGGINGFACE_API_KEY?: string;
  R2_PUBLIC_URL?: string;
  IMGBB_API_KEY?: string;
  RESEND_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  FRONTEND_URL?: string;
}

export interface UserPlan {
  plan: 'free' | 'pro' | 'elite';
  status: string;
  limits: {
    tasks: number;
    habits: number;
    notes: number;
    vault_storage_mb: number;
    ai_calls_per_day: number;
  };
  features: {
    ai_chat: boolean;
    flashcards: boolean;
    vault: boolean;
    extension_sync: boolean;
  };
}

export interface AppVariables {
  userId?: string;
  userEmail?: string;
  adminId?: string;
  userPlan?: UserPlan;
}
