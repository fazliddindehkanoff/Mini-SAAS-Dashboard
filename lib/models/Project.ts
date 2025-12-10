import mongoose, { Schema, Document, Types } from "mongoose"

export interface IProject extends Document {
  name: string
  description: string
  status: "Planning" | "In Progress" | "Completed"
  priority: "High" | "Medium" | "Low"
  assignees: string[]
  dueDate: Date
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "Completed"],
      default: "Planning",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    assignees: {
      type: [String],
      default: [],
      validate: {
        validator: function (emails: string[]) {
          return emails.every((email) => /^\S+@\S+\.\S+$/.test(email))
        },
        message: "All assignees must be valid email addresses",
      },
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
projectSchema.index({ createdBy: 1, status: 1 })
projectSchema.index({ assignees: 1 })
projectSchema.index({ dueDate: 1 })

const Project = mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema)

export default Project

