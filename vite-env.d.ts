/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_KEY: string
  readonly API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// FIX: Explicitly declare the global 'process' variable.
// This tells TypeScript: "Trust me, there is a variable named process with these properties."
declare const process: {
  env: {
    API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    [key: string]: string | undefined;
  }
};

// Fallback declaration to prevent build errors if @google/genai types are missing
declare module '@google/genai' {
  export enum Type {
    TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    NULL = 'NULL',
  }

  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    models: {
      generateContent(params: {
        model: string;
        contents: any;
        config?: any;
      }): Promise<{
        text: string;
        candidates?: any[];
      }>;
    };
  }
}