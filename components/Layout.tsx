'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Users, FileText, Package,
  UserCheck, FolderOpen, Settings, BarChart3,
  LogOut, Menu, X, Moon, Sun, Bell, Gift,
  HelpCircle,
} from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import QuickAdd from './QuickAdd'

const nav = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/crm', icon: Users, label: 'CRM' },
  { path: '/invoices', icon: FileText, label: 'Invoices' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/hr', icon: UserCheck, label: 'HR' },
  { path: '/projects', icon: FolderOpen, label: 'Projects' },
  { path: '/reports', icon: BarChart3, label: 'GST Reports' },
  { path: '/referral', icon: Gift, label: 'Earn Commission' },
  { path: '/support', icon: HelpCircle, label: 'Support' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [dark, setDark] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const toggleDark = () => {
    setDark(!dark)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('darkMode', String(!dark))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0A1628] overflow-hidden">

      {/* Sidebar */}
      <aside className={`${open ? 'w-64' : 'w-16'} transition-all duration-300 bg-[#0A1628] flex-col hidden md:flex flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {open && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#8B5CF6' }}>
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="text-white font-black text-lg" style={{ fontFamily: 'Outfit' }}>
                Samyojak
              </span>
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="text-white/60 hover:text-white transition-colors">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === path
                  ? 'bg-violet-600 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {open && (
                <span className="text-sm font-medium flex items-center gap-2">
                  {label}
                  {label === 'Earn Commission' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-black"
                      style={{ background: '#FBBF24', color: '#1E293B' }}>
                      30%
                    </span>
                  )}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          {open && (
            <div className="px-3 py-2 rounded-lg mb-2"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <p className="text-xs font-semibold text-violet-300">Powered by</p>
              <p className="text-xs font-black text-white">▲ Vercel</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut size={20} />
            {open && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white dark:bg-[#1a2740] border-b border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-gray-800 dark:text-white hidden sm:block whitespace-nowrap"
            style={{ fontFamily: 'Outfit' }}>
            {nav.find(n => n.path === pathname)?.label || 'Samyojak'}
          </h1>
          <div className="flex-1">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/support" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 relative">
              <Bell size={20} className="text-gray-600 dark:text-white/60" />
            </Link>
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              {dark
                ? <Sun size={20} className="text-white/60" />
                : <Moon size={20} className="text-gray-600" />
              }
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A1628] md:hidden flex justify-around py-2 z-30 border-t border-white/10">
        {nav.slice(0, 5).map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              pathname === path ? 'text-violet-400' : 'text-white/40'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs">{label.split(' ')[0]}</span>
          </Link>
        ))}
      </div>

      <QuickAdd />
    </div>
  )
}
