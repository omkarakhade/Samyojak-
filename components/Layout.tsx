'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPlanFromMetadata } from '@/lib/planAccess'
import {
  LayoutDashboard, Users, FileText, Package, UserCheck,
  FolderOpen, BarChart3, Brain, Settings, LogOut,
  ChevronLeft, ChevronRight, Menu, X, FileCheck,
  RefreshCw, UserPlus, TrendingUp, Ticket, Bug
} from 'lucide-react'

const ADMIN_EMAIL = 'omkarakhade083@gmail.com'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/bi', icon: BarChart3, label: 'BI Dashboard', badge: '🆕' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/crm', icon: Users, label: 'Leads & CRM' },
      { href: '/quotations', icon: FileCheck, label: 'Quotations', badge: '🆕' },
      { href: '/invoices', icon: FileText, label: 'Invoices' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/inventory', icon: Package, label: 'Inventory' },
      { href: '/projects', icon: FolderOpen, label: 'Projects' },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/hr', icon: UserCheck, label: 'HR & Payroll' },
      { href: '/recruiting', icon: UserPlus, label: 'Recruiting', badge: '🆕' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/reports', icon: TrendingUp, label: 'Reports' },
      { href: '/ai', icon: Brain, label: 'AI Assistant', planRequired: 'Complete' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/support', icon: Ticket, label: 'Support' },
      { href: '/settings', icon: Settings, label: 'Settings' },
      { href: '/debug', icon: Bug, label: 'Debug', adminOnly: true },
    ],
  },
]

const PLAN_COLORS: Record<string, string> = {
  'No Plan': '#94A3B8',
  'CRM Starter': '#8B5CF6',
  'ERP Basic': '#F472B6',
  'Business': '#34D399',
  'Complete': '#FBBF24',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState('No Plan')
  const [isAdmin, setIsAdmin] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      setPlan(getPlanFromMetadata(user) || 'No Plan')
      setIsAdmin(user.email === ADMIN_EMAIL)
    })
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const canAccess = (item: any) => {
    if (item.adminOnly) return isAdmin
    return true
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b dark:border-white/10 border-gray-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
          style={{ background: '#8B5CF6', border: '2px solid rgba(139,92,246,0.3)', boxShadow: '2px 2px 0px rgba(0,0,0,0.3)' }}>
          S
        </div>
        {!collapsed && (
          <div>
            <span className="font-black text-base text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Samyojak
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: `${PLAN_COLORS[plan]}20`,
                  color: PLAN_COLORS[plan],
                  border: `1px solid ${PLAN_COLORS[plan]}40`,
                }}>
                {plan}
              </span>
              {isAdmin && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  Admin
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(item => canAccess(item))
          if (visibleItems.length === 0) return null
          return (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-xs font-bold uppercase tracking-widest mb-2 px-2"
                  style={{ color: '#94A3B8' }}>
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative"
                      style={{
                        background: active ? '#8B5CF6' : 'transparent',
                        color: active ? 'white' : '#64748B',
                      }}
                      title={collapsed ? item.label : ''}>
                      <item.icon
                        size={18}
                        className="flex-shrink-0 transition-colors"
                        style={{ color: active ? 'white' : '#94A3B8' }} />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-semibold flex-1"
                            style={{ color: active ? 'white' : '#374151', fontFamily: 'Plus Jakarta Sans' }}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-xs font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: '#D1FAE5', color: '#065F46', fontSize: '10px' }}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {/* Tooltip when collapsed */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                          style={{ background: '#1E293B', color: 'white' }}>
                          {item.label}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User + signout */}
      <div className="border-t dark:border-white/10 border-gray-100 px-3 py-4 space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.user_metadata?.full_name || user.email}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all hover:bg-red-50 dark:hover:bg-red-900/20 group">
          <LogOut size={18} className="text-gray-400 group-hover:text-red-500 flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold text-gray-500 group-hover:text-red-500">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0A1628] overflow-hidden">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'white' }}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex flex-col border-r border-gray-100 dark:border-white/10 transition-all duration-300 flex-shrink-0 relative`}
        style={{
          width: collapsed ? '64px' : '220px',
          background: 'white',
        }}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10"
          style={{ background: 'white', borderColor: '#E2E8F0' }}>
          {collapsed
            ? <ChevronRight size={12} className="text-gray-400" />
            : <ChevronLeft size={12} className="text-gray-400" />}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a2740] flex-shrink-0">
          <button onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
              style={{ background: '#8B5CF6' }}>S</div>
            <span className="font-black text-base text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
              Samyojak
            </span>
          </div>
          <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: `${PLAN_COLORS[plan]}20`, color: PLAN_COLORS[plan] }}>
            {plan}
          </span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
