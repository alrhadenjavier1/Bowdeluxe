// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

// Create a singleton instance
let supabaseInstance = null;

export const getSupabaseClient = (token = null) => {
  // If no token provided, return the default client
  if (!token) {
    if (!supabaseInstance) {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables');
        return createMockClient();
      }
      
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
    }
    return supabaseInstance;
  }

  // Create a new client with the token
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
};

// Mock client for development
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.reject(new Error('Supabase not configured')),
    insert: () => Promise.reject(new Error('Supabase not configured')),
    update: () => Promise.reject(new Error('Supabase not configured')),
    delete: () => Promise.reject(new Error('Supabase not configured')),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
});

// Export a default client (for non-authenticated requests)
export const supabase = getSupabaseClient();
export default supabase;