"use client"

import { useState } from "react"
import { Table, Kanban } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { LayoutGrid, Table2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

type ViewMode = "table" | "kanban"

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const router = useRouter()

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Project Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-black/10 p-1 dark:border-white/10">
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

