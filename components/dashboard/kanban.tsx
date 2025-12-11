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
import { Plus, GripVertical } from "lucide-react"
import { ProjectForm, type ProjectFormData } from "@/components/project-form"
import { ProjectFilters, type ProjectFilters as ProjectFiltersType } from "@/components/project-filters"
import { getPeopleByEmails } from "@/lib/people"

// Dummy data
const initialProjects = {
  planning: [
    {
      id: "2",
      name: "Mobile App Redesign",
      priority: "Medium",
      assignees: ["jane.smith@example.com"],
      dueDate: "2024-03-01",
    },
    {
      id: "5",
      name: "Security Audit",
      priority: "High",
      assignees: ["charlie.brown@example.com", "diana.prince@example.com"],
      dueDate: "2024-02-28",
    },
  ],
  "in-progress": [
    {
      id: "1",
      name: "E-commerce Platform",
      priority: "High",
      assignees: ["john.doe@example.com", "jane.smith@example.com"],
      dueDate: "2024-02-15",
    },
    {
      id: "4",
      name: "Database Migration",
      priority: "Low",
      assignees: ["alice.williams@example.com"],
      dueDate: "2024-02-20",
    },
  ],
  completed: [
    {
      id: "3",
      name: "API Integration",
      priority: "High",
      assignees: ["bob.johnson@example.com", "alice.williams@example.com"],
      dueDate: "2024-01-30",
    },
  ],
}

type Project = {
  id: string
  name: string
  priority: string
  assignees: string[] // Array of email addresses
  dueDate: string
}

type ProjectsState = {
  planning: Project[]
  "in-progress": Project[]
  completed: Project[]
}

const priorityColors = {
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Medium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
}

function KanbanCard({ project }: { project: Project }) {
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
            {getPeopleByEmails(project.assignees).map((person) => (
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

const CARDS_PER_PAGE = 5

function KanbanColumn({
  title,
  projects,
  id,
  onAddCard,
}: {
  title: string
  projects: Project[]
  id: keyof ProjectsState
  onAddCard: (columnId: keyof ProjectsState) => void
}) {
  const { setNodeRef } = useDroppable({
    id: id,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(projects.length / CARDS_PER_PAGE)
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE
  const endIndex = startIndex + CARDS_PER_PAGE
  const paginatedProjects = projects.slice(startIndex, endIndex)

  // Reset to page 1 when projects change
  useEffect(() => {
    setCurrentPage(1)
  }, [projects.length])

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
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1">
            <SortableContext
              items={projects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {paginatedProjects.map((project) => (
                <KanbanCard key={project.id} project={project} />
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
  const [projects, setProjects] = useState<ProjectsState>(initialProjects)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createColumn, setCreateColumn] = useState<keyof ProjectsState | null>(null)
  const [filters, setFilters] = useState<ProjectFiltersType>({
    assignees: [],
    fromDate: "",
    toDate: "",
  })

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Find the project and its current column
    let activeProject: Project | null = null
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

      setProjects((prev) => {
        const newProjects = { ...prev }
        newProjects[activeColumn!] = newProjects[activeColumn!].filter(
          (p) => p.id !== activeId
        )
        newProjects[newColumn] = [...newProjects[newColumn], activeProject!]
        return newProjects
      })
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
          // Reordering within the same column
          setProjects((prev) => {
            const newProjects = { ...prev }
            const columnItems = [...newProjects[activeColumn!]]
            newProjects[activeColumn!] = arrayMove(columnItems, activeIndex, targetIndex)
            return newProjects
          })
        } else {
          // Moving to a different column
          setProjects((prev) => {
            const newProjects = { ...prev }
            const sourceItems = [...newProjects[activeColumn!]]
            const targetItems = [...newProjects[targetColumn!]]
            
            newProjects[activeColumn!] = sourceItems.filter((p) => p.id !== activeId)
            targetItems.splice(targetIndex, 0, activeProject!)
            newProjects[targetColumn!] = targetItems
            
            return newProjects
          })
        }
      }
    }

    setActiveId(null)
  }

  const handleAddCard = (columnId: keyof ProjectsState) => {
    setCreateColumn(columnId)
    setIsCreateOpen(true)
  }

  const handleCreate = (data: ProjectFormData) => {
    if (!createColumn) return

    const statusMap: Record<keyof ProjectsState, ProjectFormData["status"]> = {
      planning: "Planning",
      "in-progress": "In Progress",
      completed: "Completed",
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: data.name,
      priority: data.priority,
      assignees: data.assignees,
      dueDate: data.dueDate,
    }

    setProjects((prev) => ({
      ...prev,
      [createColumn]: [...prev[createColumn], newProject],
    }))

    setIsCreateOpen(false)
    setCreateColumn(null)
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


  // Filter projects based on filters
  const filteredProjects: ProjectsState = useMemo(() => {
    const filterFn = (projectList: Project[]) => {
      return projectList.filter((project) => {
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
    }

    return {
      planning: filterFn(projects.planning),
      "in-progress": filterFn(projects["in-progress"]),
      completed: filterFn(projects.completed),
    }
  }, [projects, filters])

  return (
    <>
      <div className="mb-4">
        <ProjectFilters filters={filters} onFiltersChange={setFilters} />
      </div>
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
          />
          <KanbanColumn
            title="In Progress"
            projects={filteredProjects["in-progress"]}
            id="in-progress"
            onAddCard={handleAddCard}
          />
          <KanbanColumn
            title="Completed"
            projects={filteredProjects.completed}
            id="completed"
            onAddCard={handleAddCard}
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

