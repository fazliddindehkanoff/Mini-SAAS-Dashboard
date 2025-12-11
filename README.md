# Mini SAAS Dashboard

A modern project management dashboard built with Next.js, TypeScript, MongoDB, and Tailwind CSS.

## Features

- 🔐 **Authentication**: JWT-based user authentication
- 📊 **Project Management**: Create, update, and delete projects
- 📋 **Table View**: View projects in a sortable table with backend pagination
- 📑 **Kanban Board**: Drag-and-drop Kanban board with per-column pagination
- 🎨 **Theme Support**: Light and dark theme with theme switcher
- 👥 **Multi-Assignee**: Assign projects to multiple team members
- 🔍 **Filtering**: Filter projects by date range and assignees
- 📄 **Pagination**: Server-side pagination for optimal performance
- 📚 **API Documentation**: Auto-generated Swagger/OpenAPI documentation at `/docs`

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd Mini-SAAS-Dashboard
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mini-saas-dashboard
   JWT_SECRET=your-strong-secret-key-here
   JWT_EXPIRES_IN=7d
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start MongoDB:**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # macOS (Homebrew)
   brew services start mongodb-community
   ```

4. **Seed database:**
   ```bash
   npm run seed
   ```
   Creates 12 users (password: `password123`) and 15 sample projects.

5. **Run the app:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## Usage

### Login

Use any seeded user:
- Email: `john.doe@example.com`
- Password: `password123`

### Dashboard

- **Table View**: View all projects with sorting and pagination
- **Kanban View**: Drag-and-drop project management
- **Filters**: Filter by date range and assignees
- **Create/Edit**: Click "New Project" or edit existing projects

### API Documentation

Visit [http://localhost:3000/docs](http://localhost:3000/docs) for interactive API documentation.

## API Endpoints

All endpoints require authentication (Bearer token).

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/projects?page=1&limit=10` - List projects (paginated)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/users` - List all users
- `GET /api/health` - Health check

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | Token expiration (default: `7d`) | No |
| `NEXT_PUBLIC_API_URL` | Public API URL | No |

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run seed` - Seed database
- `npm run test:db` - Test database connection

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Auth**: JWT (jsonwebtoken)
- **UI**: Custom Shadcn-like components
- **Drag & Drop**: @dnd-kit
- **Docs**: Swagger/OpenAPI

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── dashboard/    # Dashboard page
│   ├── docs/         # Swagger UI
│   └── login/        # Auth pages
├── components/        # React components
├── lib/
│   ├── db.ts        # Database connection
│   ├── models/      # Mongoose models
│   └── middleware/  # Auth middleware
└── scripts/         # Utility scripts
```

## License

MIT
