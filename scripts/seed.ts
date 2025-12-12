/**
 * Seed script to populate database with sample data
 * 
 * Usage: npx tsx scripts/seed.ts
 * Or: npm run seed
 */

// IMPORTANT: Load environment variables BEFORE importing any modules that use them
import dotenv from "dotenv"
import path from "path"

// Load environment variables from .env.local first
const envLocalPath = path.join(process.cwd(), ".env.local")
const envPath = path.join(process.cwd(), ".env")

// Try .env.local first
const envLocalResult = dotenv.config({ path: envLocalPath })

// If .env.local doesn't exist or MONGODB_URI is not set, try .env
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: envPath })
}

// Now import modules that depend on environment variables
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../lib/models/User"
import Project from "../lib/models/Project"
import connectDB from "../lib/db"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mini-saas-dashboard"

// Sample user data
const sampleUsers = [
  { name: "John Doe", email: "john.doe@example.com", password: "password123" },
  { name: "Jane Smith", email: "jane.smith@example.com", password: "password123" },
  { name: "Bob Johnson", email: "bob.johnson@example.com", password: "password123" },
  { name: "Alice Williams", email: "alice.williams@example.com", password: "password123" },
  { name: "Charlie Brown", email: "charlie.brown@example.com", password: "password123" },
  { name: "Diana Prince", email: "diana.prince@example.com", password: "password123" },
  { name: "Frank Miller", email: "frank.miller@example.com", password: "password123" },
  { name: "Grace Lee", email: "grace.lee@example.com", password: "password123" },
  { name: "Henry Wilson", email: "henry.wilson@example.com", password: "password123" },
  { name: "Ivy Chen", email: "ivy.chen@example.com", password: "password123" },
  { name: "Jack Taylor", email: "jack.taylor@example.com", password: "password123" },
  { name: "Kate Anderson", email: "kate.anderson@example.com", password: "password123" },
]

// Sample project data templates
const projectTemplates = [
  { name: "E-commerce Platform", description: "Build a modern e-commerce platform with payment integration", priority: "High" as const },
  { name: "Mobile App Redesign", description: "Redesign the mobile app UI/UX for better user experience", priority: "Medium" as const },
  { name: "API Integration", description: "Integrate third-party API for payment processing", priority: "High" as const },
  { name: "Database Migration", description: "Migrate database from MySQL to PostgreSQL", priority: "Low" as const },
  { name: "Security Audit", description: "Conduct comprehensive security audit of the application", priority: "High" as const },
  { name: "Performance Optimization", description: "Optimize application performance and reduce load times", priority: "Medium" as const },
  { name: "User Dashboard", description: "Create a comprehensive user dashboard with analytics", priority: "High" as const },
  { name: "Email Notification System", description: "Implement email notification system for user events", priority: "Medium" as const },
  { name: "Documentation Update", description: "Update project documentation and API references", priority: "Low" as const },
  { name: "Testing Suite", description: "Create comprehensive testing suite for all modules", priority: "High" as const },
  { name: "CI/CD Pipeline", description: "Set up continuous integration and deployment pipeline", priority: "Medium" as const },
  { name: "Monitoring System", description: "Implement application monitoring and logging system", priority: "High" as const },
  { name: "Backup System", description: "Set up automated backup system for database", priority: "Medium" as const },
  { name: "Code Review Process", description: "Establish code review process and guidelines", priority: "Low" as const },
  { name: "Feature Flags", description: "Implement feature flag system for gradual rollouts", priority: "Medium" as const },
]

const statuses: Array<"Planning" | "In Progress" | "Completed"> = ["Planning", "In Progress", "Completed"]
const priorities: Array<"High" | "Medium" | "Low"> = ["High", "Medium", "Low"]

async function seed() {
  try {
    console.log("🌱 Starting seed process...")
    
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error("❌ Error: MONGODB_URI is not set in .env.local")
      console.error("📝 Please create .env.local file with MONGODB_URI variable")
      console.error("💡 You can copy .env.example to .env.local and update the values")
      process.exit(1)
    }

    console.log(`📍 Using MongoDB URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@")}`) // Hide password

    // Connect to database
    await connectDB()
    console.log("✅ Connected to database")

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing data...")
    await User.deleteMany({})
    await Project.deleteMany({})
    console.log("✅ Cleared existing data")

    // Create users
    console.log("👥 Creating users...")
    const createdUsers = []
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      })
      createdUsers.push(user)
      console.log(`   ✓ Created user: ${user.name} (${user.email})`)
    }
    console.log(`✅ Created ${createdUsers.length} users`)

    // Create projects
    console.log("📋 Creating projects...")
    const createdProjects = []
    
    // Use first user as the primary user (the one you'll login with)
    const primaryUser = createdUsers[0]
    
    // Create 15 projects
    for (let i = 0; i < 15; i++) {
      const template = projectTemplates[i % projectTemplates.length]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const priority = i < 5 ? "High" : i < 10 ? "Medium" : "Low" // Mix priorities
      
      // Ensure primary user is always in assignees for first 10 projects
      // For remaining 5, mix it up
      let assignees: string[]
      if (i < 10) {
        // First 10 projects: primary user is always assigned, add 0-2 more random users
        const numAdditionalAssignees = Math.floor(Math.random() * 3) // 0, 1, or 2
        const otherUsers = createdUsers.slice(1)
        const shuffledOthers = [...otherUsers].sort(() => 0.5 - Math.random())
        const additionalAssignees = shuffledOthers.slice(0, numAdditionalAssignees).map((u) => u.email)
        assignees = [primaryUser.email, ...additionalAssignees]
      } else {
        // Last 5 projects: random assignees (might or might not include primary user)
        const numAssignees = Math.floor(Math.random() * 3) + 1
        const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random())
        assignees = shuffledUsers.slice(0, numAssignees).map((u) => u.email)
      }

      // Random due date (within next 90 days)
      const daysFromNow = Math.floor(Math.random() * 90)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysFromNow)

      // For first 5 projects, make primary user the creator
      // For rest, random creator
      const creator = i < 5 
        ? primaryUser._id 
        : createdUsers[Math.floor(Math.random() * createdUsers.length)]._id

      const project = await Project.create({
        name: `${template.name}${i > 0 ? ` ${i + 1}` : ""}`,
        description: template.description,
        status: status,
        priority: priority,
        assignees: assignees,
        dueDate: dueDate,
        createdBy: creator,
      })

      createdProjects.push(project)
      console.log(`   ✓ Created project: ${project.name} (${project.status})`)
    }
    console.log(`✅ Created ${createdProjects.length} projects`)

    console.log("\n✨ Seed completed successfully!")
    console.log(`📊 Summary:`)
    console.log(`   - Users: ${createdUsers.length}`)
    console.log(`   - Projects: ${createdProjects.length}`)
    console.log(`\n💡 Recommended login (this user is assigned to most projects):`)
    console.log(`   Email: ${primaryUser.email}`)
    console.log(`   Password: ${sampleUsers[0].password}`)
    console.log(`\n   (All users have the same password: password123)`)
    console.log(`\n📝 Note: The first user (${primaryUser.email}) is:`)
    console.log(`   - Creator of first 5 projects`)
    console.log(`   - Assigned to first 10 projects`)
    console.log(`   - May be assigned to remaining 5 projects (random)`)

    process.exit(0)
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  }
}

// Run seed
seed()

