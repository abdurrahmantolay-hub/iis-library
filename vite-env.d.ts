// This file augments the NodeJS namespace to add environment variables to ProcessEnv.
// It replaces the previous declaration which conflicted with existing global definitions.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    [key: string]: string | undefined;
  }
}
