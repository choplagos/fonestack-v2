'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LockKeyhole } from 'lucide-react'

import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const reportAttempt = async (emailAddress: string, deviceId: string, success: boolean, accessToken?: string) => {
    try {
      const response = await fetch('/api/admin/auth/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ email: emailAddress, success, deviceId }),
      })
      if (!response.ok) console.warn('Could not report admin login attempt.')
    } catch {
      console.warn('Could not report admin login attempt.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    try {
      // Supabase Auth has built-in rate limits; this precheck adds an extra layer before sign-in.
      const precheckResponse = await fetch('/api/admin/auth/precheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const precheck = await precheckResponse.json() as { locked?: boolean; retry_after_seconds?: number; error?: string }
      if (precheckResponse.status === 429 || precheck.locked) {
        const minutes = Math.max(1, Math.ceil(Number(precheck.retry_after_seconds ?? 60) / 60))
        setErrorMessage(`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`)
        return
      }
      if (!precheckResponse.ok) throw new Error(precheck.error || 'Could not verify sign-in attempt status.')

      let deviceId = window.localStorage.getItem('fs_device_id')
      if (!deviceId) {
        deviceId = window.crypto.randomUUID()
        window.localStorage.setItem('fs_device_id', deviceId)
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        void reportAttempt(normalizedEmail, deviceId, false)
        throw error
      }
      if (!data.user?.email) throw new Error('Supabase did not return a signed-in user.')
      void reportAttempt(normalizedEmail, deviceId, true, data.session?.access_token)

      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', data.user.email.toLowerCase())
        .maybeSingle()

      if (adminError) throw adminError
      if (!adminRecord) {
        await supabase.auth.signOut()
        throw new Error('This account is not on the Fonestack admin allowlist.')
      }

      router.replace('/admin')
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-2xl md:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-premiumYellow text-black">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-premiumYellow">
          Fonestack Admin
        </p>
        <h1 className="mt-2 text-3xl font-black">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Use an account listed in the Supabase <code>admin_users</code> table.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-premiumYellow/70"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-premiumYellow/70"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-premiumYellow px-4 py-3 font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? 'Verifying account…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
