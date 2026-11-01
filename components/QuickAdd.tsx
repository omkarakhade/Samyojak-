'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, FileText, Package, UserCheck, FolderOpen, X } from 'lucide-react'

const actions = [
  { label: 'Add Lead', icon: Users, path: '/crm', color: 'bg-blue-500' },
  { label: 'New Invoice', icon: FileText, path: '/invoices', color: 'bg-green-500' },
  { label: 'Add Product', icon: Package, path: '/inventory', color: 'bg-orange-500' },
  { label: 'Add Employee', icon: UserCheck, path: '/hr', color: 'bg-purple-500' },
  { label: 'New Project', icon: FolderOpen, path: '/projects', color: 'bg-pink-500' },
]

export default function QuickAdd() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-6">
      {open && (
        <div className="absolute bottom-16 right-0 space-y-2 mb-2">
          {actions.map(action => (
            <button
              key={action.label}
              onClick={() => { router.push(action.path); setOpen(false) }}
              className="flex items-center gap-3 bg-white dark:bg-[#1a2740] shadow-lg rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-white hover:shadow-xl transition-all whitespace-nowrap border border-gray-100 dark:border-white/10 w-full"
            >
              <div className={`${action.color} w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <action.icon size={14} className="text-white" />
              </div>
              {action.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${open ? 'bg-gray-800 rotate-45' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {open ? <X size={24} className="text-white" /> : <Plus size={24} className="text-white" />}
      </button>
    </div>
  )
}
