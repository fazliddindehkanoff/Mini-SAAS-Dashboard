import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Project from "@/lib/models/Project"
import { requireAuth } from "@/lib/middleware/auth"
import mongoose from "mongoose"

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Planning, "In Progress", Completed]
 *         description: Filter by project status
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *           format: email
 *         description: Filter by assignee email
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter projects from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter projects until this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of projects with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of projects in current page
 *                 total:
 *                   type: integer
 *                   description: Total number of projects
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Items per page
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Require authentication but don't filter by user
    requireAuth(request)

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const assignees = searchParams.getAll("assignee") // Get all assignee parameters
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")
    // Pagination parameters with validation
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const page = Math.max(1, parseInt(pageParam || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || "10", 10))) // Max 100 items per page
    const skip = (page - 1) * limit

    // Build filter - show all projects (no user-based filtering)
    const filter: any = {}

    // Add additional filters
    if (status) {
      filter.status = status
    }

    if (assignees.length > 0) {
      // Filter by assignee emails (supports multiple assignees)
      filter.assignees = { $in: assignees }
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

    // Get total count for pagination
    const total = await Project.countDocuments(filter)

    // Get paginated projects
    const projects = await Project.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return NextResponse.json({
      success: true,
      count: projects.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Project created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     project:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

    const userId = new mongoose.Types.ObjectId(user.id)
    const project = await Project.create({
      name,
      description: description || "",
      status: status || "Planning",
      priority: priority || "Medium",
      assignees: assignees || [],
      dueDate: new Date(dueDate),
      createdBy: userId,
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

