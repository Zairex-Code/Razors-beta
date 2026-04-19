import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true, name: true, email: true, role: true, isActive: true }
  })

  if (!dbUser || !dbUser.isActive) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar userRole={dbUser.role} />
      <MobileNav userRole={dbUser.role} userName={dbUser.name} />
      <main className="flex-1 flex flex-col relative overflow-y-auto md:pl-0 pl-0">
        {children}
      </main>
    </div>
  )
}