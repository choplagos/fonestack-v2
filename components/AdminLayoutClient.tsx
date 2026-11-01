'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  FilePlus2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Receipt,
  RefreshCcw,
  Settings,
  ShieldCheck,
} from 'lucide-react'

import { supabase } from '@/lib/supabase'

const menuItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/invoices', label: 'Sales & invoices', icon: Receipt },
  { href: '/admin/invoices/new', label: 'New invoice', icon: FilePlus2 },
  { href: '/admin/leads', label: 'Device requests', icon: MessageSquare },
  { href: '/admin/trade-ins', label: 'Trade-ins', icon: RefreshCcw },
  { href: '/admin/imei', label: 'IMEI lookup', icon: ShieldCheck },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

type AccessState = 'checking' | 'allowed' | 'error'

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'
  const [access, setAccess] = useState<AccessState>(isLoginPage ? 'allowed' : 'checking')
  const [accessError, setAccessError] = useState('')
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    if (isLoginPage) {
      setAccess('allowed')
      return
    }

    let active = true

    const verifyAdmin = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (!userData.user?.email) {
          router.replace('/admin/login')
          return
        }
        if (userError) throw userError

        const { data: adminRecord, error: adminError } = await supabase
          .from('admin_users')
          .select('name')
          .eq('email', userData.user.email.toLowerCase())
          .maybeSingle()

        if (adminError) throw adminError
        if (!adminRecord) {
          await supabase.auth.signOut()
          router.replace('/admin/login?reason=not-authorized')
          return
        }

        if (active) {
          setAdminName(adminRecord.name || userData.user.email)
          setAccess('allowed')
        }
      } catch (error) {
        if (active) {
          setAccessError(error instanceof Error ? error.message : 'Unable to verify admin access.')
          setAccess('error')
        }
      }
    }

    void verifyAdmin()
    return () => {
      active = false
    }
  }, [isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  if (access === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Checking admin access…
      </div>
    )
  }

  if (access === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-white">
        <p role="alert" className="max-w-xl text-sm text-red-300">
          Could not verify your admin account: {accessError}
        </p>
        <button
          type="button"
          onClick={() => router.replace('/admin/login')}
          className="rounded-xl bg-premiumYellow px-5 py-3 text-sm font-bold text-black"
        >
          Return to sign in
        </button>
      </div>
    )
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAccessError(error.message)
      setAccess('error')
      return
    }
    router.replace('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-[#050505] md:flex md:gap-6 md:p-6">
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mb-5 flex flex-col rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl md:mb-0 md:w-72 md:shrink-0 md:p-7"
      >
        <Link href="/admin" className="mb-7 text-xl font-black text-white">
          FONE<span className="text-premiumYellow">STACK</span>
          <span className="mt-1 block text-[10px] font-mono font-normal uppercase tracking-[0.3em] text-slate-400">
            Admin Console
          </span>
        </Link>

        <nav aria-label="Admin navigation" className="grid grid-cols-2 gap-2 md:flex md:flex-1 md:flex-col">
          {menuItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:py-3 md:text-sm ${
                  active
                    ? 'bg-premiumYellow text-black'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 md:mt-8">
          <span className="max-w-[65%] truncate text-xs text-slate-400">{adminName}</span>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </motion.aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="mb-6 flex items-end justify-between px-1 md:px-4">
          <div>
            <h1 className="text-2xl font-black capitalize text-white md:text-3xl">
              {pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || 'Overview'}
            </h1>
            <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Fonestack · Supabase connected
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Admin session active
          </div>
        </header>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
