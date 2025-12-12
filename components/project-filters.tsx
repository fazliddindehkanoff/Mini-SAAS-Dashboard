"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssigneeCombobox } from "@/components/assignee-combobox"
import { X } from "lucide-react"

export type ProjectFilters = {
  assignees: string[]
  fromDate: string
  toDate: string
}

interface ProjectFiltersProps {
  filters: ProjectFilters
  onFiltersChange: (filters: ProjectFilters) => void
}

export function ProjectFilters({ filters, onFiltersChange }: ProjectFiltersProps) {
  const handleClear = () => {
    onFiltersChange({
      assignees: [],
      fromDate: "",
      toDate: "",
    })
  }

  const hasActiveFilters =
    filters.assignees.length > 0 || filters.fromDate || filters.toDate

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned To</label>
            <AssigneeCombobox
              value={filters.assignees}
              onChange={(emails) =>
                onFiltersChange({ ...filters, assignees: emails })
              }
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="fromDate" className="text-sm font-medium">
              From Date
            </label>
            <Input
              id="fromDate"
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                onFiltersChange({ ...filters, fromDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="toDate" className="text-sm font-medium">
              To Date
            </label>
            <Input
              id="toDate"
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                onFiltersChange({ ...filters, toDate: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


