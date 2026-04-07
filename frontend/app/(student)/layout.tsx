import { StudentSidebar } from '@/components/StudentSidebar'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="w-full lg:w-64 fixed top-0 z-30">
        <StudentSidebar />
      </div>
      <main className="flex-1 lg:ml-64 mt-16 md:mt-0 lg:mt-0 relative z-10 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
