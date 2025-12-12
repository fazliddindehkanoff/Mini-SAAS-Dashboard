import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || ""

// Only throw error at runtime, not during build
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  if (!MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI is not defined. Please set it in .env.local")
  }
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
  // Check at runtime, not at module load time (for seed scripts and other standalone scripts)
  const uri = process.env.MONGODB_URI || MONGODB_URI
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("❌ MongoDB connection error:", e)
    throw e
  }

  return cached.conn
}

export default connectDB

