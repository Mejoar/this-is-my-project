/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_TOKEN?: string
  readonly VITE_API_URL?: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
