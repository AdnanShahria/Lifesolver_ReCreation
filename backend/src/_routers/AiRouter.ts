import type { Env } from '../types';

export type AiProvider = 'groq' | 'workers-ai' | 'openai' | 'anthropic' | 'huggingface';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiOptions {
  messages: AiMessage[];
  stream?: boolean;
  maxTokens?: number;
  provider?: AiProvider;
}

export async function callAi(options: AiOptions, env: Env): Promise<Response | unknown> {
  const primary = (options.provider ?? env.AI_PROVIDER ?? 'groq') as AiProvider;
  const fallback = (env.AI_FALLBACK ?? 'workers-ai') as AiProvider;

  try {
    return await _callProvider(primary, options, env);
  } catch (err) {
    console.warn(`[AiRouter] ${primary} failed: ${err}. Falling back to ${fallback}`);
    return await _callProvider(fallback, options, env);
  }
}

async function _callProvider(provider: AiProvider, opts: AiOptions, env: Env) {
  switch (provider) {
    case 'groq':
      return fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: opts.messages,
          stream: opts.stream ?? true,
          max_tokens: opts.maxTokens ?? 2048
        })
      });

    case 'workers-ai':
      return env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: opts.messages,
        stream: opts.stream
      });

    case 'openai':
      return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: opts.messages,
          stream: opts.stream ?? true
        })
      });

    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
}
