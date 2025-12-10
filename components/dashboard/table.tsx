"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { ProjectForm, type ProjectFormData } from "@/components/project-form"

type Project = {
  id: string
  name: string
  status: "Planning" | "In Progress" | "Completed"
  priority: "High" | "Medium" | "Low"
  assignee: string
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
    assignee: "John Doe",
    dueDate: "2024-02-15",
    description: "Build a modern e-commerce platform with payment integration",
  },
  {
    id: "2",
    name: "Mobile App Redesign",
    status: "Planning",
    priority: "Medium",
    assignee: "Jane Smith",
    dueDate: "2024-03-01",
    description: "Redesign the mobile app UI/UX for better user experience",
  },
  {
    id: "3",
    name: "API Integration",
    status: "Completed",
    priority: "High",
    assignee: "Bob Johnson",
    dueDate: "2024-01-30",
    description: "Integrate third-party API for payment processing",
  },
  {
    id: "4",
    name: "Database Migration",
    status: "In Progress",
    priority: "Low",
    assignee: "Alice Williams",
    dueDate: "2024-02-20",
    description: "Migrate database from MySQL to PostgreSQL",
  },
  {
    id: "5",
    name: "Security Audit",
    status: "Planning",
    priority: "High",
    assignee: "Charlie Brown",
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

export function Table() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Projects</CardTitle>
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
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Priority</th>
                  <th className="text-left p-4 font-semibold">Assignee</th>
                  <th className="text-left p-4 font-semibold">Due Date</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
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
                    <td className="p-4">{project.assignee}</td>
                    <td className="p-4">{project.dueDate}</td>
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
                ))}
              </tbody>
            </table>
          </div>
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
        initialData={editingProject || undefined}
        mode="edit"
      />
    </>
  )
}

