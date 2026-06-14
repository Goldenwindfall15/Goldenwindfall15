/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Identity Services の Client ID（任意・本番連携用） */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
