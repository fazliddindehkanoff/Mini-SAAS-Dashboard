import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Project from "@/lib/models/Project"
import { requireAuth } from "@/lib/middleware/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const user = requireAuth(request)

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const assignee = searchParams.get("assignee")
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")

    // Build filter
    const filter: any = { createdBy: user.id }

    if (status) {
      filter.status = status
    }

    if (assignee) {
      filter.assignees = { $in: [assignee] }
    }

    if (fromDate || toDate) {
      filter.dueDate = {}
      if (fromDate) {
        filter.dueDate.$gte = new Date(fromDate)
      }
      if (toDate) {
        filter.dueDate.$lte = new Date(toDate)
      }
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      count: projects.length,
      data: {
        projects,
      },
    })
  } catch (error: any) {
    console.error("Get projects error:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const user = requireAuth(request)

    const body = await request.json()
    const { name, description, status, priority, assignees, dueDate } = body

    // Validation
    if (!name || !dueDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and due date are required",
        },
        { status: 400 }
      )
    }

    const project = await Project.create({
      name,
      description: description || "",
      status: status || "Planning",
      priority: priority || "Medium",
      assignees: assignees || [],
      dueDate: new Date(dueDate),
      createdBy: user.id,
    })

    await project.populate("createdBy", "name email")

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: {
          project,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Create project error:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    )
  }
}

