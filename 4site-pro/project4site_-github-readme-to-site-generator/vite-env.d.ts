/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GITHUB_TOKEN?: string
  readonly VITE_FAL_API_KEY?: string
  readonly VITE_AURA_API_KEY?: string
  readonly VITE_MCP_SERVER_PORT?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_APP_URL?: string
  readonly VITE_POLAR_CLIENT_ID?: string
  readonly VITE_POLAR_CLIENT_SECRET?: string
  readonly VITE_POLAR_WEBHOOK_SECRET?: string
  readonly VITE_OPENROUTER_API_KEY?: string
  readonly VITE_DEMO_MODE?: string
  readonly VITE_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}