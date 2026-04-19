'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import { signOutAction } from '@/app/actions/auth-actions'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BOSS', 'EMPLOYEE'] },
  { name: 'Inventario', href: '/dashboard/inventory', icon: Package, roles: ['ADMIN', 'BOSS', 'EMPLOYEE'] },
  { name: 'Importaciones', href: '/dashboard/imports', icon: Truck, roles: ['ADMIN', 'BOSS'] },
  { name: 'Clientes', href: '/dashboard/customers', icon: Users, roles: ['ADMIN', 'BOSS', 'EMPLOYEE'] },
  { name: 'Ventas', href: '/dashboard/sales', icon: ShoppingCart, roles: ['ADMIN', 'BOSS', 'EMPLOYEE'] },
  { name: 'Gastos', href: '/dashboard/expenses', icon: Receipt, roles: ['ADMIN', 'BOSS'] },
  { name: 'Reportes', href: '/dashboard/reports', icon: BarChart3, roles: ['ADMIN', 'BOSS'] },
]

interface SidebarProps {
  userRole?: string
}

export function Sidebar({ userRole = 'EMPLOYEE' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-cyan-500/20 bg-background/50 backdrop-blur-md flex flex-col h-full">
      <div className="p-6">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">RAZORS</h1>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          if (!item.roles.includes(userRole)) return null

          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_14px_rgba(0,247,255,0.15)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-cyan-500/20 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <Settings className="w-5 h-5" />
          Configuración
        </Link>
        <button
          onClick={() => signOutAction()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}