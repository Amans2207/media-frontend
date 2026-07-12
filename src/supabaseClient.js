import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktvgvdhilqmyobxkyipg.supabase.co'
const supabaseAnonKey = 'sb_publishable_Tyj_hJ_DZGiabdBGtohfig_2iQnhIjq'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
