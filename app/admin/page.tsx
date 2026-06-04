import { getProjects, getProcessSteps, getSiteContent, getInquiries } from '@/lib/cms'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [projects, steps, content, inquiries] = await Promise.all([
    getProjects(),
    getProcessSteps(),
    getSiteContent(),
    getInquiries(),
  ])

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-[-1.5px]">CMS Dashboard</h1>
        <p className="text-white/60 mt-1">
          Rediger indholdet på højfynsspartel.dk. Ændringer er synlige med det samme.
        </p>
      </div>

      <AdminDashboard
        initialProjects={projects}
        initialSteps={steps}
        initialContent={content}
        initialInquiries={inquiries}
      />
    </div>
  )
}
