"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Loader2 } from "lucide-react"
import { ProjectForm, type ProjectFormData } from "@/components/project-form"
import { ProjectFilters, type ProjectFilters as ProjectFiltersType } from "@/components/project-filters"
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

type ProjectWithId = Project & { id: string }

type ProjectsState = {
  planning: ProjectWithId[]
  "in-progress": ProjectWithId[]
  completed: ProjectWithId[]
}

// Helper to convert API project to frontend format
function normalizeProject(project: Project): ProjectWithId {
  return {
    ...project,
    id: project._id,
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
  }
}

// Helper to map status to column key
function statusToColumn(status: string): keyof ProjectsState {
  if (status === "In Progress") return "in-progress"
  if (status === "Completed") return "completed"
  return "planning"
}

// Helper to map column key to status
function columnToStatus(column: keyof ProjectsState): "Planning" | "In Progress" | "Completed" {
  if (column === "in-progress") return "In Progress"
  if (column === "completed") return "Completed"
  return "Planning"
}

const priorityColors = {
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Medium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

function KanbanCard({ project, users }: { project: ProjectWithId; users: Array<{ email: string; name: string }> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-4 mb-3 cursor-grab active:cursor-grabbing shadow-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm text-card-foreground">{project.name}</h3>
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            priorityColors[project.priority as keyof typeof priorityColors]
          }`}
        >
          {project.priority}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        {project.assignees.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {getPeopleByEmails(project.assignees, users).map((person) => (
              <span
                key={person.email}
                className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
              >
                {person.name}
              </span>
            ))}
          </div>
        ) : (
          <span>Unassigned</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        Due: {project.dueDate}
      </div>
    </div>
  )
}

const DEFAULT_CARDS_PER_PAGE = 5
const PAGE_SIZE_OPTIONS = [3, 5, 10, 15]

function KanbanColumn({
  title,
  projects,
  id,
  onAddCard,
  users,
  itemsPerPage,
  onItemsPerPageChange,
}: {
  title: string
  projects: ProjectWithId[]
  id: keyof ProjectsState
  onAddCard: (columnId: keyof ProjectsState) => void
  users: Array<{ email: string; name: string }>
  itemsPerPage: number
  onItemsPerPageChange: (size: number) => void
}) {
  const { setNodeRef } = useDroppable({
    id: id,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = projects.slice(startIndex, endIndex)

  // Reset to page 1 when projects or page size change
  useEffect(() => {
    setCurrentPage(1)
  }, [projects.length, itemsPerPage])

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[300px] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {projects.length}
            </span>
          </div>
          {id === "planning" && (
            <div className="flex items-center gap-2 mt-2">
              <label htmlFor="kanban-page-size" className="text-xs text-muted-foreground">
                Cards per page:
              </label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  onItemsPerPageChange(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger id="kanban-page-size" className="w-20 h-8 text-xs">
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
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1">
            <SortableContext
              items={projects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {paginatedProjects.map((project) => (
                <KanbanCard key={project.id} project={project} users={users} />
              ))}
            </SortableContext>
            {projects.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No projects
              </div>
            )}
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
                  <PaginationItem>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>
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
          <Button
            variant="ghost"
            className="w-full mt-2"
            size="sm"
            onClick={() => onAddCard(id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function Kanban() {
  const toast = useToast()
  const [projects, setProjects] = useState<ProjectsState>({
    planning: [],
    "in-progress": [],
    completed: [],
  })
  const [users, setUsers] = useState<Array<{ email: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createColumn, setCreateColumn] = useState<keyof ProjectsState | null>(null)
  const [filters, setFilters] = useState<ProjectFiltersType>({
    assignees: [],
    fromDate: "",
    toDate: "",
  })
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_CARDS_PER_PAGE)

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

  const fetchProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // For Kanban, we fetch all projects (no pagination on backend for Kanban view)
      // Since Kanban has its own per-column pagination
      const apiFilters: any = {
        limit: 1000, // Fetch all projects for Kanban view
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

      // Group projects by status
      const grouped: ProjectsState = {
        planning: [],
        "in-progress": [],
        completed: [],
      }

      filtered.forEach((project) => {
        const column = statusToColumn(project.status)
        grouped[column].push(project)
      })

      setProjects(grouped)
    } catch (err: any) {
      setError(err.message || "Failed to fetch projects")
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch when filters change
  useEffect(() => {
    fetchProjects()
  }, [filters.fromDate, filters.toDate])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Find the project and its current column
    let activeProject: ProjectWithId | null = null
    let activeColumn: keyof ProjectsState | null = null
    let activeIndex = -1

    for (const [column, items] of Object.entries(projects)) {
      const index = items.findIndex((p) => p.id === activeId)
      if (index !== -1) {
        activeProject = items[index]
        activeColumn = column as keyof ProjectsState
        activeIndex = index
        break
      }
    }

    if (!activeProject || !activeColumn) {
      setActiveId(null)
      return
    }

    // If dropped on a column
    if (["planning", "in-progress", "completed"].includes(overId)) {
      const newColumn = overId as keyof ProjectsState

      if (activeColumn === newColumn) {
        setActiveId(null)
        return
      }

      // Update status in backend
      try {
        const newStatus = columnToStatus(newColumn)
        await api.updateProject(activeProject._id, { status: newStatus })
        
        // Update local state
        setProjects((prev) => {
          const newProjects = { ...prev }
          newProjects[activeColumn!] = newProjects[activeColumn!].filter(
            (p) => p.id !== activeId
          )
          newProjects[newColumn] = [...newProjects[newColumn], { ...activeProject!, status: newStatus }]
          return newProjects
        })
        toast.success("Project moved", `Project moved to ${newStatus}`)
      } catch (err: any) {
        toast.error("Failed to update project", err.message || "An error occurred")
      }
    } else {
      // If dropped on another card, find its column and index
      let targetColumn: keyof ProjectsState | null = null
      let targetIndex = -1

      for (const [column, items] of Object.entries(projects)) {
        const index = items.findIndex((p) => p.id === overId)
        if (index !== -1) {
          targetColumn = column as keyof ProjectsState
          targetIndex = index
          break
        }
      }

      if (targetColumn) {
        if (activeColumn === targetColumn) {
          // Reordering within the same column - just update local state
          setProjects((prev) => {
            const newProjects = { ...prev }
            const columnItems = [...newProjects[activeColumn!]]
            newProjects[activeColumn!] = arrayMove(columnItems, activeIndex, targetIndex)
            return newProjects
          })
        } else {
          // Moving to a different column - update status in backend
          try {
            const newStatus = columnToStatus(targetColumn)
            await api.updateProject(activeProject._id, { status: newStatus })
            
            // Update local state
            setProjects((prev) => {
              const newProjects = { ...prev }
              const sourceItems = [...newProjects[activeColumn!]]
              const targetItems = [...newProjects[targetColumn!]]
              
              newProjects[activeColumn!] = sourceItems.filter((p) => p.id !== activeId)
              targetItems.splice(targetIndex, 0, { ...activeProject!, status: newStatus })
              newProjects[targetColumn!] = targetItems
              
              return newProjects
            })
            toast.success("Project moved", `Project moved to ${newStatus}`)
          } catch (err: any) {
            console.error("Failed to update project status:", err)
            toast.error("Failed to update project", err.message || "An error occurred")
          }
        }
      }
    }

    setActiveId(null)
  }

  const handleAddCard = (columnId: keyof ProjectsState) => {
    setCreateColumn(columnId)
    setIsCreateOpen(true)
  }

  const handleCreate = async (data: ProjectFormData) => {
    if (!createColumn) return

    try {
      await api.createProject({
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignees: data.assignees,
        dueDate: data.dueDate,
      })
      await fetchProjects() // Refetch to get updated list
      setIsCreateOpen(false)
      setCreateColumn(null)
      toast.success("Project created", "The project has been successfully created")
    } catch (err: any) {
      toast.error("Failed to create project", err.message || "An error occurred")
    }
  }

  const getInitialFormData = (): ProjectFormData | undefined => {
    if (!createColumn) return undefined

    const statusMap: Record<keyof ProjectsState, ProjectFormData["status"]> = {
      planning: "Planning",
      "in-progress": "In Progress",
      completed: "Completed",
    }

    return {
      name: "",
      description: "",
      status: statusMap[createColumn],
      priority: "Medium",
      assignees: [],
      dueDate: "",
    }
  }


  // Projects are already filtered in fetchProjects
  const filteredProjects: ProjectsState = useMemo(() => {
    return projects
  }, [projects])

  return (
    <>
      <div className="mb-4">
        <ProjectFilters filters={filters} onFiltersChange={setFilters} />
      </div>
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
        <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            title="Planning"
            projects={filteredProjects.planning}
            id="planning"
            onAddCard={handleAddCard}
            users={users}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
          <KanbanColumn
            title="In Progress"
            projects={filteredProjects["in-progress"]}
            id="in-progress"
            onAddCard={handleAddCard}
            users={users}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
          <KanbanColumn
            title="Completed"
            projects={filteredProjects.completed}
            id="completed"
            onAddCard={handleAddCard}
            users={users}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      <DragOverlay>
        {activeId ? (
          <div className="bg-card border border-border rounded-lg p-4 w-64 shadow-lg">
            <div className="font-semibold text-sm text-card-foreground">
              {[
                ...projects.planning,
                ...projects["in-progress"],
                ...projects.completed,
              ].find((p) => p.id === activeId)?.name}
            </div>
          </div>
        ) : null}
      </DragOverlay>
      </DndContext>
      )}

      <ProjectForm
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setCreateColumn(null)
        }}
        onSubmit={handleCreate}
        initialData={getInitialFormData()}
        mode="create"
      />
    </>
  )
}

