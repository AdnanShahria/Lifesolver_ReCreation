# 🧠 LifeSolver AI Architecture: Tiered RAG + Cascade

1. **Tiered Context Synthesis (`POST /api/ai/context`)**:
   - **Tier 1 (Cached in KV, 60s TTL)**: High-level metrics (active task count, habit streak summary, daily cash balance, sleep recovery score).
   - **Tier 2 (D1 Parameterized Query)**: Current active page context (e.g., current note being edited or active project tasks).
   - **Tier 3 (Vectorize Semantic Search)**: 1536-dim vector embeddings of relevant notes and study syllabi.

2. **Provider Cascade (`AiRouter.ts`)**:
   - **Primary**: Groq API (LLaMA-3.3-70B-Versatile) for sub-second streaming completions.
   - **Fallback**: Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`) with zero external API key requirements.

3. **Multi-Intent Action Approval Cards**:
   - The AI never writes directly to D1. It emits structured JSON action payloads.
   - The UI presents an interactive Preview Card allowing one-click execution or dismissal.
