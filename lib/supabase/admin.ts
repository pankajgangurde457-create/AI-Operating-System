import { createClient } from "@supabase/supabase-js";

let adminInstance: ReturnType<typeof createClient> | null = null;

/**
 * Lazily instantiates and returns a Supabase client that uses the service role key.
 * This client bypasses Row Level Security (RLS) for internal administrative tasks.
 */
export function getSupabaseAdmin(): any {
  if (!adminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    }

    adminInstance = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminInstance;
}
