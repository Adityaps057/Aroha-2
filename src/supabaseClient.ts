import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wbxyhtrygwkrfomfhqum.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8YbKlzZ3r1EIYcD2CzLO3A_LyIsp1YV";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
