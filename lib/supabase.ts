import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

let client: ReturnType<typeof createClient<Database>> | undefined

function getClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }

  client = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return client
}

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, property) {
    const instance = getClient()
    const value = Reflect.get(instance, property, instance)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})