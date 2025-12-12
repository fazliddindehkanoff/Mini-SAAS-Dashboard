import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
import { requireAuth } from "@/lib/middleware/auth"

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (for assignee selection)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           email:
 *                             type: string
 *                           name:
 *                             type: string
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

    // Require authentication
    requireAuth(request)

    // Get all users (only email and name for assignee selection)
    const users = await User.find({})
      .select("email name")
      .sort({ name: 1 })

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((user) => ({
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
        })),
      },
    })
  } catch (error: any) {
    console.error("Get users error:", error)

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


