import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Project from "@/lib/models/Project"
import { requireAuth } from "@/lib/middleware/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const user = requireAuth(request)
    const { id } = await params

    const project = await Project.findOne({
      _id: id,
      createdBy: user.id,
    }).populate("createdBy", "name email")

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        project,
      },
    })
  } catch (error: any) {
    console.error("Get project error:", error)

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const user = requireAuth(request)
    const { id } = await params
    const body = await request.json()
    const { name, description, status, priority, assignees, dueDate } = body

    // Find project and verify ownership
    const project = await Project.findOne({
      _id: id,
      createdBy: user.id,
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 }
      )
    }

    // Update fields
    if (name) project.name = name
    if (description !== undefined) project.description = description
    if (status) project.status = status
    if (priority) project.priority = priority
    if (assignees) project.assignees = assignees
    if (dueDate) project.dueDate = new Date(dueDate)

    await project.save()
    await project.populate("createdBy", "name email")

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: {
        project,
      },
    })
  } catch (error: any) {
    console.error("Update project error:", error)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const user = requireAuth(request)
    const { id } = await params

    const project = await Project.findOneAndDelete({
      _id: id,
      createdBy: user.id,
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Project not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete project error:", error)

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

