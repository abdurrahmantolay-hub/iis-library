
import { createClient } from '@supabase/supabase-js';

// Load environment variables. 
// We support both standard Vite env vars (import.meta.env) and the process.env polyfill defined in vite.config.ts
const getEnvVar = (key: string, viteKey: string) => {
    // Check process.env (injected by vite define)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    // Check import.meta.env (native Vite)
    if ((import.meta as any).env && (import.meta as any).env[viteKey]) {
        return (import.meta as any).env[viteKey];
    }
    return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_KEY', 'VITE_SUPABASE_KEY');

// Loose check to allow for real URLs
const isPlaceholderUrl = !supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('your-project-url');
const isPlaceholderKey = !supabaseKey || supabaseKey === 'placeholder-key' || supabaseKey.includes('your-anon-key');

// Helper to check if we are actually connected or using placeholders
export const isConfigured = !isPlaceholderUrl && !isPlaceholderKey;

if (!isConfigured) {
    console.warn("Supabase is not configured. Missing valid SUPABASE_URL or SUPABASE_KEY in .env file.");
} else {
    // Mask key for security in logs
    console.log(`Supabase configured with URL: ${supabaseUrl}`);
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseKey || 'placeholder-key'
);
