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
    <div className="flex h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/3 blur-[150px] rounded-full -ml-48 -mt-48" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/3 blur-[120px] rounded-full -mr-32 -mb-32" />
      </div>

      <div className="relative z-10 flex h-screen w-full">
        <Sidebar userRole={dbUser.role} />
        <MobileNav userRole={dbUser.role} userName={dbUser.name} />
        <main className="flex-1 flex flex-col relative overflow-y-auto p-8 md:p-10 print:p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
