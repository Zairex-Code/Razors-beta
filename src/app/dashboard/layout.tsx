export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <aside className="w-64 border-r border-cyan-500/20 bg-background/50 backdrop-blur-md hidden md:flex flex-col">
        <div className="p-6 text-xl font-bold text-cyan-400 tracking-wider">RAZORS</div>
      </aside>
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {children}
      </main>
    </div>
  );
}