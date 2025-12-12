import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import mongoose from "mongoose"

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check database connection and server health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy and database is connected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 database:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                       example: true
 *                     state:
 *                       type: string
 *                       example: connected
 *                     name:
 *                       type: string
 *                       example: mini-saas-dashboard
 *                     host:
 *                       type: string
 *                       example: localhost
 *                     port:
 *                       type: number
 *                       example: 27017
 *                     collections:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["users", "projects"]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Server is unhealthy or database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export async function GET() {
  try {
    // Test database connection
    await connectDB()

    const dbState = mongoose.connection.readyState
    const dbStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    const dbStatus = dbStates[dbState as keyof typeof dbStates] || "unknown"

    // Get database info
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Database connection not established")
    }

    const dbName = db.databaseName || "unknown"
    const host = mongoose.connection.host || "unknown"
    const port = mongoose.connection.port || "unknown"

    // Test a simple query
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((col) => col.name)

    return NextResponse.json({
      success: true,
      status: "healthy",
      database: {
        connected: dbState === 1,
        state: dbStatus,
        name: dbName,
        host: host,
        port: port,
        collections: collectionNames,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        error: error.message || "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

