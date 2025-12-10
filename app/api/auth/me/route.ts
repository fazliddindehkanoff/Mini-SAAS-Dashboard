import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
import { requireAuth } from "@/lib/middleware/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const user = requireAuth(request)

    const userDoc = await User.findById(user.id)
    if (!userDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userDoc._id,
          email: userDoc.email,
          name: userDoc.name,
        },
      },
    })
  } catch (error: any) {
    console.error("Get me error:", error)
    
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

