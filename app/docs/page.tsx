"use client"

import { useEffect, useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function SwaggerPage() {
  const [spec, setSpec] = useState<any>(null)

  useEffect(() => {
    // Fetch spec from API route
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => console.error("Error loading Swagger spec:", err))
  }, [])

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading API Documentation...</h1>
          <p className="text-muted-foreground">Please wait while we load the Swagger specification.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SwaggerUI
        spec={spec}
        deepLinking={true}
        displayRequestDuration={true}
        tryItOutEnabled={true}
        supportedSubmitMethods={["get", "post", "put", "delete", "patch"]}
      />
    </div>
  )
}

