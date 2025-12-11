"use client"

import { useState } from "react"
import { Table, Kanban } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { AuthGuard } from "@/components/auth-guard"
import { LayoutGrid, Table2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"

type ViewMode = "table" | "kanban"

function DashboardContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const router = useRouter()

  const handleLogout = () => {
    auth.removeToken()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Project Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-border p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8"
              >
                <Table2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {viewMode === "table" ? <Table /> : <Kanban />}
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

