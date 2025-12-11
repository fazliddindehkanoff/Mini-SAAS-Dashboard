"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { ProjectForm, type ProjectFormData } from "@/components/project-form"
import { ProjectFilters, type ProjectFilters as ProjectFiltersType } from "@/components/project-filters"
import { getPeopleByEmails } from "@/lib/people"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

type Project = {
  id: string
  name: string
  status: "Planning" | "In Progress" | "Completed"
  priority: "High" | "Medium" | "Low"
  assignees: string[] // Array of email addresses
  dueDate: string
  description: string
}

// Dummy data
const initialProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    status: "In Progress",
    priority: "High",
    assignees: ["john.doe@example.com", "jane.smith@example.com"],
    dueDate: "2024-02-15",
    description: "Build a modern e-commerce platform with payment integration",
  },
  {
    id: "2",
    name: "Mobile App Redesign",
    status: "Planning",
    priority: "Medium",
    assignees: ["jane.smith@example.com"],
    dueDate: "2024-03-01",
    description: "Redesign the mobile app UI/UX for better user experience",
  },
  {
    id: "3",
    name: "API Integration",
    status: "Completed",
    priority: "High",
    assignees: ["bob.johnson@example.com", "alice.williams@example.com"],
    dueDate: "2024-01-30",
    description: "Integrate third-party API for payment processing",
  },
  {
    id: "4",
    name: "Database Migration",
    status: "In Progress",
    priority: "Low",
    assignees: ["alice.williams@example.com"],
    dueDate: "2024-02-20",
    description: "Migrate database from MySQL to PostgreSQL",
  },
  {
    id: "5",
    name: "Security Audit",
    status: "Planning",
    priority: "High",
    assignees: ["charlie.brown@example.com", "diana.prince@example.com"],
    dueDate: "2024-02-28",
    description: "Conduct comprehensive security audit of the application",
  },
]

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

const ITEMS_PER_PAGE = 10

export function Table() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [filters, setFilters] = useState<ProjectFiltersType>({
    assignees: [],
    fromDate: "",
    toDate: "",
  })
  const [currentPage, setCurrentPage] = useState(1)

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filter by assignees
      if (filters.assignees.length > 0) {
        const hasMatchingAssignee = filters.assignees.some((email) =>
          project.assignees.includes(email)
        )
        if (!hasMatchingAssignee) return false
      }

      // Filter by date range
      if (filters.fromDate && project.dueDate < filters.fromDate) {
        return false
      }
      if (filters.toDate && project.dueDate > filters.toDate) {
        return false
      }

      return true
    })
  }, [projects, filters])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  const handleCreate = (data: ProjectFormData) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...data,
    }
    setProjects([...projects, newProject])
  }

  const handleEdit = (data: ProjectFormData) => {
    if (!editingProject) return
    setProjects(
      projects.map((p) =>
        p.id === editingProject.id ? { ...editingProject, ...data } : p
      )
    )
    setEditingProject(null)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((p) => p.id !== id))
    }
  }

  const openEditDialog = (project: Project) => {
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
              <CardTitle>Projects ({filteredProjects.length})</CardTitle>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                      const assignedPeople = getPeopleByEmails(project.assignees)
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
            {totalPages > 1 && (
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
        initialData={editingProject || undefined}
        mode="edit"
      />
    </>
  )
}

