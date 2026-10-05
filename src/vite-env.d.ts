/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COLLEGE_EMAIL_DOMAIN: string;
  readonly VITE_COLLEGE_NAME: string;
  readonly VITE_COLLEGE_CAMPUS_LOCATION: string;
  readonly VITE_COLLEGE_LAT: string;
  readonly VITE_COLLEGE_LNG: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OSRM_API_URL: string;
  readonly VITE_NOMINATIM_API_URL: string;
  readonly VITE_ENABLE_WEB_PUSH: string;
  readonly VITE_DEMO_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
