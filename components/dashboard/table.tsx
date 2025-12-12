"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { ProjectForm, type ProjectFormData } from "@/components/project-form"
import { ProjectFilters, type ProjectFilters as ProjectFiltersType } from "@/components/project-filters"
import { getPeopleByEmails } from "@/lib/people"
import { api, type Project } from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

const statusColors = {
  Planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

const priorityColors = {
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Medium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

const DEFAULT_ITEMS_PER_PAGE = 10
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

// Helper to convert API project to frontend format
function normalizeProject(project: Project): Project & { id: string } {
  return {
    ...project,
    id: project._id,
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
  }
}

export function Table() {
  const [projects, setProjects] = useState<(Project & { id: string })[]>([])
  const [users, setUsers] = useState<Array<{ email: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<(Project & { id: string }) | null>(null)
  const [filters, setFilters] = useState<ProjectFiltersType>({
    assignees: [],
    fromDate: "",
    toDate: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)

  // Fetch users and projects from API
  useEffect(() => {
    fetchUsers()
    fetchProjects()
  }, [])

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await api.getUsers()
      setUsers(
        fetchedUsers.map((user) => ({
          email: user.email,
          name: user.name,
        }      ))
      )
    } catch (err) {
      // Silently handle user fetch errors
    }
  }

  const [totalProjects, setTotalProjects] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchProjects = async () => {
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
        apiFilters.assignee = filters.assignees[0]
      }

      const result = await api.getProjects(apiFilters)
      const normalizedProjects = result.projects.map(normalizeProject)

      // Apply client-side filtering for multiple assignees
      let filtered = normalizedProjects
      if (filters.assignees.length > 0) {
        filtered = normalizedProjects.filter((project) =>
          filters.assignees.some((email) => project.assignees.includes(email))
        )
      }

      setProjects(filtered)
      setTotalProjects(result.total)
      setTotalPages(result.totalPages)
    } catch (err: any) {
      setError(err.message || "Failed to fetch projects")
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch when filters, page, or page size change
  useEffect(() => {
    fetchProjects()
  }, [filters.fromDate, filters.toDate, currentPage, itemsPerPage])

  // Reset to page 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, itemsPerPage])

  // Projects are already paginated from backend
  const paginatedProjects = projects

  const handleCreate = async (data: ProjectFormData) => {
    try {
      const newProject = await api.createProject({
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignees: data.assignees,
        dueDate: data.dueDate,
      })
      await fetchProjects() // Refetch to get updated list
      setIsCreateOpen(false)
    } catch (err: any) {
      alert(err.message || "Failed to create project")
    }
  }

  const handleEdit = async (data: ProjectFormData) => {
    if (!editingProject) return
    try {
      await api.updateProject(editingProject._id, {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignees: data.assignees,
        dueDate: data.dueDate,
      })
      await fetchProjects() // Refetch to get updated list
      setEditingProject(null)
      setIsEditOpen(false)
    } catch (err: any) {
      alert(err.message || "Failed to update project")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const project = projects.find((p) => p.id === id)
      if (!project) return

      await api.deleteProject(project._id)
      await fetchProjects() // Refetch to get updated list
    } catch (err: any) {
      alert(err.message || "Failed to delete project")
    }
  }

  const openEditDialog = (project: Project & { id: string }) => {
    setEditingProject(project)
    setIsEditOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <ProjectFilters filters={filters} onFiltersChange={setFilters} />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Projects ({totalProjects})</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="page-size" className="text-sm text-muted-foreground">
                    Items per page:
                  </label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger id="page-size" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading projects...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-destructive mb-2">{error}</p>
                  <Button variant="outline" onClick={fetchProjects}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Name</th>
                    <th className="text-left p-4 font-semibold text-foreground">Status</th>
                    <th className="text-left p-4 font-semibold text-foreground">Priority</th>
                    <th className="text-left p-4 font-semibold text-foreground">Assignees</th>
                    <th className="text-left p-4 font-semibold text-foreground">Due Date</th>
                    <th className="text-left p-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.length > 0 ? (
                    paginatedProjects.map((project) => {
                      const assignedPeople = getPeopleByEmails(project.assignees, users)
                      return (
                        <tr
                          key={project.id}
                          className="border-b border-border hover:bg-accent/50 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-foreground">{project.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {project.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                statusColors[project.status as keyof typeof statusColors]
                              }`}
                            >
                              {project.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                priorityColors[project.priority as keyof typeof priorityColors]
                              }`}
                            >
                              {project.priority}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {assignedPeople.length > 0 ? (
                                assignedPeople.map((person) => (
                                  <span
                                    key={person.email}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                  >
                                    {person.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">Unassigned</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-foreground">{project.dueDate}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(project)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDelete(project.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
            {!isLoading && !error && totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }
                      return null
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProjectForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        mode="create"
      />

      <ProjectForm
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setEditingProject(null)
        }}
        onSubmit={handleEdit}
        initialData={
          editingProject
            ? {
                name: editingProject.name,
                description: editingProject.description || "",
                status: editingProject.status,
                priority: editingProject.priority,
                assignees: editingProject.assignees,
                dueDate: editingProject.dueDate,
              }
            : undefined
        }
        mode="edit"
      />
    </>
  )
}

