"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  title?: string
  description?: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const toastStyles = {
  success: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400",
  error: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400",
}

const toastIcons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
}

export function ToastComponent({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)

  React.useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss after duration
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(toast.id)
    }, 300) // Match animation duration
  }

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300",
        toastStyles[toast.type],
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0"
      )}
      style={{ minWidth: "300px", maxWidth: "400px" }}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold",
            toast.type === "success" && "bg-green-500 text-white",
            toast.type === "error" && "bg-red-500 text-white",
            toast.type === "info" && "bg-blue-500 text-white",
            toast.type === "warning" && "bg-yellow-500 text-white"
          )}
        >
          {toastIcons[toast.type]}
        </div>
      </div>
      <div className="flex-1 space-y-1">
        {toast.title && (
          <div className="text-sm font-semibold">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:bottom-auto sm:right-4 sm:top-4 sm:w-auto">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}

