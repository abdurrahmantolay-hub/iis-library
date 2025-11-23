
import { createClient } from '@supabase/supabase-js';

// INSTRUCTIONS FOR DEPLOYMENT (Vercel, Netlify, etc.):
// 1. Create a project at https://supabase.com
// 2. In your hosting dashboard, add the following Environment Variables:
//    - SUPABASE_URL: (Your project URL, e.g., https://xyz.supabase.co)
//    - SUPABASE_KEY: (Your 'anon' public key)

// We use a valid-format placeholder URL so the app doesn't crash immediately if keys are missing.
// This allows the app to load in "Demo Mode" using local mock data.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
