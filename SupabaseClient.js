import { createClient } from "@supabase/supabase-js";

const supabaseurl = import.meta.env.VITE_SUPABASE_URL
const supabasekey = import.meta.env.VITE_SUPABASE_ANON_KEY


export const supabase = createClient(supabaseurl,supabasekey,{
    auth:{
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    // Add time skew tolerance (5 minutes in milliseconds)
    timeSkewTolerance: 300000 // 5 minutes
  }
})

