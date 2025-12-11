"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { ToastContainer } from "@/components/ui/toast"
import type { Toast, ToastType } from "@/components/ui/toast"

interface ToastContextType {
  toast: (options: {
    title?: string
    description?: string
    type?: ToastType
    duration?: number
  }) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (options: {
      title?: string
      description?: string
      type?: ToastType
      duration?: number
    }) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = {
        id,
        title: options.title,
        description: options.description,
        type: options.type || "info",
        duration: options.duration,
      }
      setToasts((prev) => [...prev, newToast])
    },
    []
  )

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: "success" })
    },
    [addToast]
  )

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: "error", duration: 6000 })
    },
    [addToast]
  )

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: "info" })
    },
    [addToast]
  )

  const warning = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: "warning" })
    },
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

