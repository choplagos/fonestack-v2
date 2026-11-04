'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
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
  MessageCircle,
  Plus,
  Truck,
  History,
  Users,
  ClipboardList,
  ShieldAlert,
  MessageSquareText,
  UserRound,
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import GlobalSearch from '@/components/admin/GlobalSearch'
import { canOpenAdminPath, getAdminRoleCapabilities, type AdminRoleCapabilities } from '@/lib/adminRole'

const menuItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true, roles: ['owner', 'staff'] },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/suppliers', label: 'Suppliers', icon: Truck, roles: ['owner', 'staff'] },
  { href: '/admin/purchases', label: 'Purchases', icon: Receipt, roles: ['owner', 'staff'] },
  { href: '/admin/stock-history', label: 'Stock history', icon: History },
  { href: '/admin/invoices', label: 'Sales & invoices', icon: Receipt, roles: ['owner', 'staff'] },
  { href: '/admin/invoices/new', label: 'New invoice', icon: FilePlus2, roles: ['owner', 'staff'] },
  { href: '/admin/leads', label: 'Device requests', icon: MessageSquare },
  { href: '/admin/trade-ins', label: 'Trade-ins', icon: RefreshCcw },
  { href: '/admin/imei', label: 'IMEI lookup', icon: ShieldCheck },
  { href: '/admin/templates', label: 'WhatsApp templates', icon: MessageCircle, roles: ['owner', 'staff'] },
  { href: '/admin/customers', label: 'Customers', icon: UserRound, roles: ['owner', 'staff'] },
  { href: '/admin/team', label: 'Team', icon: Users, roles: ['owner'] },
  { href: '/admin/activity', label: 'Activity', icon: ClipboardList, roles: ['owner'] },
  { href: '/admin/security', label: 'Security', icon: ShieldAlert, roles: ['owner'] },
  { href: '/admin/reply-assistant', label: 'Reply assistant', icon: MessageSquareText, roles: ['owner', 'staff'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['owner'] },
]

type AccessState = 'checking' | 'allowed' | 'error'
type NeedsActionCounts = { lowStock: number; invoices: number; leads: number; tradeIns: number }

const EMPTY_COUNTS: NeedsActionCounts = { lowStock: 0, invoices: 0, leads: 0, tradeIns: 0 }

type AdminContextValue = AdminRoleCapabilities & { name: string }
const AdminRoleContext = createContext<AdminContextValue | null>(null)

export function useAdminRole() {
  const context = useContext(AdminRoleContext)
  if (!context) throw new Error('useAdminRole must be used within the admin layout.')
  return context
}

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLoginPage = pathname === '/admin/login'
  const [access, setAccess] = useState<AccessState>(isLoginPage ? 'allowed' : 'checking')
  const [accessError, setAccessError] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminRole, setAdminRole] = useState<AdminRoleCapabilities | null>(null)
  const [counts, setCounts] = useState<NeedsActionCounts>(EMPTY_COUNTS)

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
          .select('name, role')
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
          setAdminRole(getAdminRoleCapabilities(adminRecord.role))
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

  useEffect(() => {
    if (access !== 'allowed' || isLoginPage || !adminRole) return
    let active = true
    const loadCounts = async () => {
      const [invoices, leads, tradeIns, inventory] = await Promise.all([
        adminRole.role === 'technician'
          ? Promise.resolve({ count: 0, error: null })
          : supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('device_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('trade_in_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }).lte('stock_quantity', 3).neq('status', 'demo'),
      ])
      const failed = [invoices.error, leads.error, tradeIns.error, inventory.error].find(Boolean)
      if (failed) {
        console.error('Could not refresh admin needs-action counts:', failed.message)
        return
      }
      if (active) {
        setCounts({
          invoices: invoices.count ?? 0,
          leads: leads.count ?? 0,
          tradeIns: tradeIns.count ?? 0,
          lowStock: inventory.count ?? 0,
        })
      }
    }
    const onFocus = () => void loadCounts()
    void loadCounts()
    window.addEventListener('focus', onFocus)
    return () => {
      active = false
      window.removeEventListener('focus', onFocus)
    }
  }, [access, adminRole, isLoginPage])

  useEffect(() => {
    if (access !== 'allowed' || isLoginPage) return
    if (adminRole && !canOpenAdminPath(adminRole.role, pathname)) {
      router.replace(`/admin?denied=${encodeURIComponent(pathname.split('/').filter(Boolean).at(-1) || 'page')}`)
    }
  }, [access, adminRole, isLoginPage, pathname, router])

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

  if (!adminRole) return null
  const isDeniedLanding = pathname === '/admin' && Boolean(searchParams.get('denied'))
  if (!isDeniedLanding && !canOpenAdminPath(adminRole.role, pathname)) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">Redirecting…</div>
  }
  const adminContext = { ...adminRole, name: adminName }
  if (pathname.endsWith('/receipt')) {
    return <AdminRoleContext.Provider value={adminContext}>{children}</AdminRoleContext.Provider>
  }

  return (
    <AdminRoleContext.Provider value={adminContext}>
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
          {menuItems.filter((item) => {
            if (!('roles' in item)) return canOpenAdminPath(adminRole.role, item.href)
            return (item.roles ?? []).includes(adminRole.role)
          }).map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            const badgeCount = item.href === '/admin/inventory'
              ? counts.lowStock
              : item.href === '/admin/invoices'
                ? counts.invoices
                : item.href === '/admin/leads'
                  ? counts.leads
                  : item.href === '/admin/trade-ins'
                    ? counts.tradeIns
                    : null
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
                <span className="min-w-0 flex-1">{item.label}</span>
                {badgeCount !== null && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-black/10 text-black' : 'bg-premiumYellow/15 text-premiumYellow'}`}>
                    {badgeCount}
                  </span>
                )}
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

      <main className="min-w-0 flex-1 overflow-y-auto pb-20 md:pb-0">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3 px-1 md:px-4">
          <div>
            <h1 className="text-2xl font-black capitalize text-white md:text-3xl">
              {pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || 'Overview'}
            </h1>
            <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Fonestack · Supabase connected
            </p>
          </div>
          <div className="flex items-center gap-2">
            {adminRole.role !== 'technician' && <GlobalSearch />}
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Admin session active
            </div>
          </div>
        </header>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {pathname === '/admin' && searchParams.get('denied') ? (
            <p role="status" className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              You do not have access to that page.
            </p>
          ) : children}
        </motion.div>
      </main>
      {pathname !== '/admin/invoices/new' && adminRole.role !== 'technician' && canOpenAdminPath(adminRole.role, '/admin/invoices/new') && (
        <Link
          href="/admin/invoices/new"
          aria-label="Create a new invoice"
          className="print:hidden fixed bottom-5 right-4 z-40 inline-flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-premiumYellow text-black shadow-xl shadow-black/30 sm:bottom-7 sm:right-7 sm:h-auto sm:w-auto sm:rounded-2xl sm:px-5 sm:py-3"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
          <span className="hidden sm:inline">New invoice</span>
        </Link>
      )}
    </div>
    </AdminRoleContext.Provider>
  )
}
