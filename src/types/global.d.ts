// Global type definitions

// Extend the Window interface to include our environment variables
interface Window {
  ENV_SUPABASE_URL?: string;
  ENV_SUPABASE_ANON_KEY?: string;
}

// Make TypeScript aware of these properties on the global window object
declare global {
  interface Window {
    ENV_SUPABASE_URL?: string;
    ENV_SUPABASE_ANON_KEY?: string;
  }
}
