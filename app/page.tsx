import { DashboardClient } from "@/components/dashboard/dashboard-client"

type PageProps = {
  searchParams: Promise<{ page?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const initialPage = params.page ? parseInt(params.page, 10) : 1
  
  // Validate page number
  const validPage = isNaN(initialPage) || initialPage < 1 ? 1 : initialPage
  
  return <DashboardClient initialPage={validPage} />
}

