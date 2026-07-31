import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(url, key)
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
  if (error) throw error
  return data
}
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}
export async function signOut() { await supabase.auth.signOut() }
export function onAuthChange(cb) {
  return supabase.auth.onAuthStateChange((e, s) => { cb(s?.user ?? null) })
}