/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_IS_STANDALONE: string;
  readonly VITE_EXTERNAL_URL: string;
  readonly VITE_HISTORY_URL: string;
  readonly VITE_HISTORY_API_URL: string;
  readonly VITE_REALTIME_URL: string;
  readonly VITE_WRAPPER_LOG_ACTIVE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
