import { auth } from "./auth"

// Use relative URLs in browser, or absolute URL if provided
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use relative URLs or configured base URL
    return process.env.NEXT_PUBLIC_API_URL || ""
  }
  // Server-side: use configured base URL or default
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  count?: number
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export interface Project {
  _id: string
  name: string
  description: string
  status: "Planning" | "In Progress" | "Completed"
  priority: "High" | "Medium" | "Low"
  assignees: string[]
  dueDate: string
  createdBy?: {
    _id: string
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = auth.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const baseUrl = getApiBaseUrl()
      const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle 401 - Unauthorized
        if (response.status === 401) {
          auth.removeToken()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
          throw new Error("Unauthorized. Please login again.")
        }

        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error: any) {
      throw error
    }
  }

  // Projects API
  async getProjects(filters?: {
    status?: string
    assignee?: string | string[]
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  }): Promise<{ projects: Project[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryParams = new URLSearchParams()
    if (filters?.status) queryParams.append("status", filters.status)
    if (filters?.assignee) {
      // Handle both single assignee and array of assignees
      const assignees = Array.isArray(filters.assignee) ? filters.assignee : [filters.assignee]
      assignees.forEach((assignee) => queryParams.append("assignee", assignee))
    }
    if (filters?.fromDate) queryParams.append("fromDate", filters.fromDate)
    if (filters?.toDate) queryParams.append("toDate", filters.toDate)
    if (filters?.page) queryParams.append("page", filters.page.toString())
    if (filters?.limit) queryParams.append("limit", filters.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = `/api/projects${queryString ? `?${queryString}` : ""}`

    const response = await this.request<{ 
      projects: Project[]
      total: number
      page: number
      limit: number
      totalPages: number
    }>(endpoint)
    
    return {
      projects: response.data?.projects || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 0,
    }
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.request<{ project: Project }>(`/api/projects/${id}`)
    if (!response.data?.project) {
      throw new Error("Project not found")
    }
    return response.data.project
  }

  async createProject(project: {
    name: string
    description?: string
    status?: "Planning" | "In Progress" | "Completed"
    priority?: "High" | "Medium" | "Low"
    assignees?: string[]
    dueDate: string
  }): Promise<Project> {
    const response = await this.request<{ project: Project }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(project),
    })
    if (!response.data?.project) {
      throw new Error("Failed to create project")
    }
    return response.data.project
  }

  async updateProject(
    id: string,
    project: {
      name?: string
      description?: string
      status?: "Planning" | "In Progress" | "Completed"
      priority?: "High" | "Medium" | "Low"
      assignees?: string[]
      dueDate?: string
    }
  ): Promise<Project> {
    const response = await this.request<{ project: Project }>(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    })
    if (!response.data?.project) {
      throw new Error("Failed to update project")
    }
    return response.data.project
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/api/projects/${id}`, {
      method: "DELETE",
    })
  }

  // Users API
  async getUsers(): Promise<Array<{ _id: string; email: string; name: string }>> {
    const response = await this.request<{ users: Array<{ _id: string; email: string; name: string }> }>("/api/users")
    return response.data?.users || []
  }
}

export const api = new ApiClient()

