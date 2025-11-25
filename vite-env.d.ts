
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_KEY: string
  readonly API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Augment the existing ProcessEnv interface to include our environment variables.
// This prevents conflicts with global 'process' declarations from @types/node.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    [key: string]: string | undefined;
  }
}

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
