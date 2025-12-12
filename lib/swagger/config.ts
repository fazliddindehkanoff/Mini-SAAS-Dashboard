import swaggerJsdoc, { Options } from "swagger-jsdoc"

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini SAAS Dashboard API",
      version: "1.0.0",
      description: "API documentation for Mini SAAS Dashboard - Project management system with authentication and CRUD operations",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "password123",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "password123",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login successful",
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
        Project: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              example: "E-commerce Platform",
            },
            description: {
              type: "string",
              example: "Build a modern e-commerce platform",
            },
            status: {
              type: "string",
              enum: ["Planning", "In Progress", "Completed"],
              example: "In Progress",
            },
            priority: {
              type: "string",
              enum: ["High", "Medium", "Low"],
              example: "High",
            },
            assignees: {
              type: "array",
              items: {
                type: "string",
                format: "email",
              },
              example: ["john@example.com", "jane@example.com"],
            },
            dueDate: {
              type: "string",
              format: "date-time",
              example: "2024-03-01T00:00:00.000Z",
            },
            createdBy: {
              $ref: "#/components/schemas/User",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        ProjectRequest: {
          type: "object",
          required: ["name", "dueDate"],
          properties: {
            name: {
              type: "string",
              example: "E-commerce Platform",
            },
            description: {
              type: "string",
              example: "Build a modern e-commerce platform",
            },
            status: {
              type: "string",
              enum: ["Planning", "In Progress", "Completed"],
              example: "Planning",
            },
            priority: {
              type: "string",
              enum: ["High", "Medium", "Low"],
              example: "High",
            },
            assignees: {
              type: "array",
              items: {
                type: "string",
                format: "email",
              },
              example: ["john@example.com"],
            },
            dueDate: {
              type: "string",
              format: "date",
              example: "2024-03-01",
            },
          },
        },
        ProjectsResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            count: {
              type: "number",
              example: 10,
            },
            data: {
              type: "object",
              properties: {
                projects: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Project",
                  },
                },
              },
            },
          },
        },
        ProjectResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                project: {
                  $ref: "#/components/schemas/Project",
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication endpoints",
      },
      {
        name: "Projects",
        description: "Project management endpoints",
      },
    ],
  },
  apis: [
    "./app/api/**/*.ts", // Path to the API files
  ],
}

export const swaggerSpec = swaggerJsdoc(options)

