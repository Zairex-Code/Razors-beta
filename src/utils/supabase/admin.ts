import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createSupabaseAdmin> | null = null

export function getSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  if (!adminClient) {
    adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  return adminClient
}
