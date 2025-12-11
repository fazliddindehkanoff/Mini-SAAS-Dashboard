"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { people, type Person } from "@/lib/people"
import { cn } from "@/lib/utils"

interface AssigneeComboboxProps {
  value: string[]
  onChange: (emails: string[]) => void
}

export function AssigneeCombobox({ value, onChange }: AssigneeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedPeople = people.filter((p) => value.includes(p.email))
  const filteredPeople = people.filter(
    (person) =>
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (email: string) => {
    if (value.includes(email)) {
      onChange(value.filter((e) => e !== email))
    } else {
      onChange([...value, email])
    }
  }

  const handleRemove = (email: string) => {
    onChange(value.filter((e) => e !== email))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedPeople.length > 0
                ? `${selectedPeople.length} assignee${selectedPeople.length > 1 ? "s" : ""} selected`
                : "Select assignees..."}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by name or email..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No people found.</CommandEmpty>
              <CommandGroup>
                {filteredPeople.map((person) => {
                  const isSelected = value.includes(person.email)
                  return (
                    <CommandItem
                      key={person.email}
                      value={`${person.name} ${person.email}`}
                      onSelect={(currentValue) => {
                        // Only handle if it matches our person
                        if (currentValue.includes(person.name) || currentValue.includes(person.email)) {
                          handleSelect(person.email)
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <div
                        className="flex items-center w-full pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(person.email)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{person.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {person.email}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedPeople.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPeople.map((person) => (
            <div
              key={person.email}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
            >
              <span>{person.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(person.email)}
                className="ml-1 rounded-full hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

