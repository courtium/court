// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";

try {
  const metaEnv = (import.meta as any).env;
  SUPABASE_URL = metaEnv?.VITE_SUPABASE_URL ?? "";
  SUPABASE_ANON_KEY = metaEnv?.VITE_SUPABASE_ANON_KEY ?? "";
} catch {
  SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
  SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? "";
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase env missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);