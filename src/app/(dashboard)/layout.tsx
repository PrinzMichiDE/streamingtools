import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

/**
 * Dashboard layout with sidebar navigation and header.
 * 
 * Provides consistent layout structure for all dashboard pages
 * with responsive sidebar and header components.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

