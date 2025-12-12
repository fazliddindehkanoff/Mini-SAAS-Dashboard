"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, Kanban } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { LayoutGrid, Table2, LogOut } from "lucide-react"
import { auth } from "@/lib/auth"
import { ProjectFilters, type ProjectFilters as ProjectFiltersType } from "@/components/project-filters"
import { api, type Project } from "@/lib/api"

type ViewMode = "table" | "kanban"

function normalizeProject(project: Project): Project & { id: string } {
  return {
    ...project,
    id: project._id,
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
  }
}

type DashboardClientProps = {
  initialPage?: number
}

export function DashboardClient({ initialPage = 1 }: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  
  // Get currentPage from URL or use initialPage
  const getCurrentPage = useMemo(() => {
    const pageParam = searchParams.get("page")
    return pageParam ? parseInt(pageParam, 10) : initialPage
  }, [searchParams, initialPage])
  
  const [currentPage, setCurrentPageState] = useState(getCurrentPage)
  
  // Sync currentPage with URL when it changes
  const setCurrentPage = (page: number) => {
    setCurrentPageState(page)
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", page.toString())
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }
  
  // Update currentPage when URL changes
  useEffect(() => {
    setCurrentPageState(getCurrentPage)
  }, [getCurrentPage])
  
  // Filters state
  const [filters, setFilters] = useState<ProjectFiltersType>({
    assignees: [],
    fromDate: "",
    toDate: "",
  })
  
  // Users state
  const [users, setUsers] = useState<Array<{ email: string; name: string }>>([])
  
  // Projects state for Table (paginated)
  const [tableProjects, setTableProjects] = useState<(Project & { id: string })[]>([])
  const [totalProjects, setTotalProjects] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Projects state for Kanban (all projects grouped by status)
  const [kanbanProjects, setKanbanProjects] = useState<{
    planning: (Project & { id: string })[]
    "in-progress": (Project & { id: string })[]
    completed: (Project & { id: string })[]
  }>({
    planning: [],
    "in-progress": [],
    completed: [],
  })
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch users
  const fetchUsers = async () => {
    try {
      const fetchedUsers = await api.getUsers()
      setUsers(
        fetchedUsers.map((user) => ({
          email: user.email,
          name: user.name,
        }))
      )
    } catch (err) {
      // Silently handle user fetch errors
    }
  }

  // Fetch projects for Table view (paginated)
  const fetchTableProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const apiFilters: any = {
        page: currentPage,
        limit: itemsPerPage,
      }
      if (filters.fromDate) apiFilters.fromDate = filters.fromDate
      if (filters.toDate) apiFilters.toDate = filters.toDate
      if (filters.assignees.length > 0) {
        apiFilters.assignee = filters.assignees
      }

      const result = await api.getProjects(apiFilters)
      const normalizedProjects = result.projects.map(normalizeProject)

      setTableProjects(normalizedProjects)
      setTotalProjects(result.total)
      setTotalPages(result.totalPages)
    } catch (err: any) {
      setError(err.message || "Failed to fetch projects")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to map status to column key
  function statusToColumn(status: string): "planning" | "in-progress" | "completed" {
    if (status === "In Progress") return "in-progress"
    if (status === "Completed") return "completed"
    return "planning"
  }

  // Fetch projects for Kanban view (all projects)
  const fetchKanbanProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const apiFilters: any = {
        limit: 1000, // Fetch all projects for Kanban view
      }
      if (filters.fromDate) apiFilters.fromDate = filters.fromDate
      if (filters.toDate) apiFilters.toDate = filters.toDate
      if (filters.assignees.length > 0) {
        apiFilters.assignee = filters.assignees
      }

      const result = await api.getProjects(apiFilters)
      const normalizedProjects = result.projects.map(normalizeProject)

      // Group projects by status
      const grouped = {
        planning: [] as (Project & { id: string })[],
        "in-progress": [] as (Project & { id: string })[],
        completed: [] as (Project & { id: string })[],
      }

      normalizedProjects.forEach((project) => {
        const column = statusToColumn(project.status)
        grouped[column].push(project)
      })

      setKanbanProjects(grouped)
    } catch (err: any) {
      setError(err.message || "Failed to fetch projects")
    } finally {
      setIsLoading(false)
    }
  }

  // Create a filter key that changes when any filter changes
  const filterKey = useMemo(() => {
    return JSON.stringify({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      assignees: [...filters.assignees].sort(),
    })
  }, [filters.fromDate, filters.toDate, filters.assignees.join(",")])

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [])

  // Fetch projects based on view mode
  useEffect(() => {
    if (viewMode === "table") {
      fetchTableProjects()
    } else {
      fetchKanbanProjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, filterKey, currentPage, itemsPerPage])

  // Reset to page 1 when filters or page size change (for table view)
  useEffect(() => {
    if (viewMode === "table") {
      setCurrentPage(1)
    }
  }, [filters, itemsPerPage, viewMode])

  // Refetch function to be passed to components
  const refetchProjects = () => {
    if (viewMode === "table") {
      fetchTableProjects()
    } else {
      fetchKanbanProjects()
    }
  }

  const handleLogout = () => {
    auth.removeToken()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Project Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-border p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8"
              >
                <Table2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="space-y-4">
          <ProjectFilters filters={filters} onFiltersChange={setFilters} />
          {viewMode === "table" ? (
            <Table
              data={{
                projects: tableProjects,
                users,
                totalProjects,
                totalPages,
              }}
              loading={{ isLoading, error }}
              pagination={{
                currentPage,
                itemsPerPage,
                onPageChange: setCurrentPage,
                onItemsPerPageChange: setItemsPerPage,
              }}
              onRefetch={refetchProjects}
            />
          ) : (
            <Kanban
              data={{
                projects: kanbanProjects,
                users,
              }}
              loading={{ isLoading, error }}
              pagination={{
                currentPage,
                onPageChange: setCurrentPage,
              }}
              onRefetch={refetchProjects}
            />
          )}
        </div>
      </main>
    </div>
  )
}
