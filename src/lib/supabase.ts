import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pnjqbvuekaznqzhzootp.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuanFidnVla2F6bnF6aHpvb3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MzQzMjQsImV4cCI6MjA5ODAxMDMyNH0._x4y8j17obJLDl-k4lA6P7a2lKFqEZUeTHgtweqn_ec";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
