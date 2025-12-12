"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { ProjectForm, type ProjectFormData } from "@/components/project-form"
import { getPeopleByEmails } from "@/lib/people"
import { api, type Project } from "@/lib/api"
import { useToast } from "@/components/toast-provider"
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

type TableProps = {
  data: {
    projects: (Project & { id: string })[]
    users: Array<{ email: string; name: string }>
    totalProjects: number
    totalPages: number
  }
  loading: {
    isLoading: boolean
    error: string | null
  }
  pagination: {
    currentPage: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (size: number) => void
  }
  onRefetch: () => void
}

export function Table({ data, loading, pagination, onRefetch }: TableProps) {
  const { projects, users, totalProjects, totalPages } = data
  const { isLoading, error } = loading
  const { currentPage, itemsPerPage, onPageChange, onItemsPerPageChange } = pagination
  const toast = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<(Project & { id: string }) | null>(null)

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
      onRefetch() // Refetch to get updated list
      setIsCreateOpen(false)
      toast.success("Project created", "The project has been successfully created")
    } catch (err: any) {
      toast.error("Failed to create project", err.message || "An error occurred")
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
      onRefetch() // Refetch to get updated list
      setEditingProject(null)
      setIsEditOpen(false)
      toast.success("Project updated", "The project has been successfully updated")
    } catch (err: any) {
      toast.error("Failed to update project", err.message || "An error occurred")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const project = projects.find((p) => p.id === id)
      if (!project) return

      await api.deleteProject(project._id)
      onRefetch() // Refetch to get updated list
      toast.success("Project deleted", "The project has been successfully deleted")
    } catch (err: any) {
      toast.error("Failed to delete project", err.message || "An error occurred")
    }
  }

  const openEditDialog = (project: Project & { id: string }) => {
    setEditingProject(project)
    setIsEditOpen(true)
  }

  return (
    <>
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
                      onItemsPerPageChange(Number(value))
                      onPageChange(1)
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
                  <Button variant="outline" onClick={onRefetch}>
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
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                              onClick={() => onPageChange(page)}
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
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

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

