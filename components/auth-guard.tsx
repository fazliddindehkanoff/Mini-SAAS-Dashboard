"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  if (!auth.isAuthenticated()) {
    return null
  }

  return <>{children}</>
}

