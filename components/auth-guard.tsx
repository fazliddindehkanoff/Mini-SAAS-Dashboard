"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Only check authentication on client side
    const authenticated = auth.isAuthenticated()
    setIsAuthenticated(authenticated)

    if (!authenticated) {
      router.push("/login")
    }
  }, [router])

  // Show nothing until we know the auth status (prevents hydration mismatch)
  if (isAuthenticated === null) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}


