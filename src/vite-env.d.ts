/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_API: string
  readonly VITE_API_URL: string
  readonly VITE_MAPBOX_TOKEN: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_MAX_FILE_SIZE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}