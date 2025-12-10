"use client"

import { useState } from "react"
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

// Dummy data
const initialProjects = {
  planning: [
    {
      id: "2",
      name: "Mobile App Redesign",
      priority: "Medium",
      assignee: "Jane Smith",
      dueDate: "2024-03-01",
    },
    {
      id: "5",
      name: "Security Audit",
      priority: "High",
      assignee: "Charlie Brown",
      dueDate: "2024-02-28",
    },
  ],
  "in-progress": [
    {
      id: "1",
      name: "E-commerce Platform",
      priority: "High",
      assignee: "John Doe",
      dueDate: "2024-02-15",
    },
    {
      id: "4",
      name: "Database Migration",
      priority: "Low",
      assignee: "Alice Williams",
      dueDate: "2024-02-20",
    },
  ],
  completed: [
    {
      id: "3",
      name: "API Integration",
      priority: "High",
      assignee: "Bob Johnson",
      dueDate: "2024-01-30",
    },
  ],
}

type Project = {
  id: string
  name: string
  priority: string
  assignee: string
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
      className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-4 mb-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm">{project.name}</h3>
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
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
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        {project.assignee}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        Due: {project.dueDate}
      </div>
    </div>
  )
}

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

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[300px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {projects.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {projects.map((project) => (
              <KanbanCard key={project.id} project={project} />
            ))}
          </SortableContext>
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
      assignee: data.assignee,
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
      assignee: "",
      dueDate: "",
    }
  }

  const allProjectIds = [
    ...projects.planning.map((p) => p.id),
    ...projects["in-progress"].map((p) => p.id),
    ...projects.completed.map((p) => p.id),
  ]

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn
            title="Planning"
            projects={projects.planning}
            id="planning"
            onAddCard={handleAddCard}
          />
          <KanbanColumn
            title="In Progress"
            projects={projects["in-progress"]}
            id="in-progress"
            onAddCard={handleAddCard}
          />
          <KanbanColumn
            title="Completed"
            projects={projects.completed}
            id="completed"
            onAddCard={handleAddCard}
          />
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-4 w-64 shadow-lg">
              <div className="font-semibold text-sm">
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

