/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_AI: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
