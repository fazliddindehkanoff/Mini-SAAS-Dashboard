"use client"

import { useEffect, useState } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function SwaggerPage() {
  const [spec, setSpec] = useState<any>(null)

  useEffect(() => {
    // Suppress React strict mode warnings for swagger-ui-react
    const originalError = console.error
    const originalWarn = console.warn
    
    const shouldSuppress = (args: any[]): boolean => {
      // Check all arguments for warning patterns
      const message = args.join(" ")
      const warningPatterns = [
        "UNSAFE_componentWillReceiveProps",
        "UNSAFE_componentWillMount",
        "UNSAFE_componentWillUpdate",
        "Please update the following components",
        "RequestBodyEditor",
        "ModelCollapse",
        "Move data fetching code",
        "refactor your code to use memoization",
        "static getDerivedStateFromProps",
        "componentDidUpdate",
      ]
      
      return warningPatterns.some((pattern) => message.includes(pattern))
    }
    
    console.error = (...args: any[]) => {
      if (shouldSuppress(args)) {
        return
      }
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      if (shouldSuppress(args)) {
        return
      }
      originalWarn.apply(console, args)
    }

    // Fetch spec from API route
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((err) => {
        // Use original error for our own errors
        originalError("Error loading Swagger spec:", err)
      })

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Loading API Documentation...</h1>
          <p className="text-gray-600">Please wait while we load the Swagger specification.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ backgroundColor: "#ffffff" }}>
      <style jsx global>{`
        /* Light theme overrides for Swagger UI */
        .swagger-ui {
          font-family: inherit;
        }
        .swagger-ui .topbar {
          background-color: #fff;
          border-bottom: 1px solid #e5e7eb;
        }
        .swagger-ui .topbar .download-url-wrapper {
          background-color: #fff;
        }
        .swagger-ui .topbar .download-url-wrapper input {
          border-color: #d1d5db;
          color: #111827;
        }
        .swagger-ui .info {
          background-color: #fff;
          color: #111827;
        }
        .swagger-ui .info .title {
          color: #111827;
        }
        .swagger-ui .scheme-container {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
        }
        .swagger-ui .opblock {
          background-color: #fff;
          border: 1px solid #e5e7eb;
        }
        .swagger-ui .opblock.opblock-post {
          border-color: #3b82f6;
        }
        .swagger-ui .opblock.opblock-get {
          border-color: #10b981;
        }
        .swagger-ui .opblock.opblock-put {
          border-color: #f59e0b;
        }
        .swagger-ui .opblock.opblock-delete {
          border-color: #ef4444;
        }
        .swagger-ui .opblock-tag {
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }
        .swagger-ui .opblock-summary {
          color: #111827;
        }
        .swagger-ui .opblock-description-wrapper,
        .swagger-ui .opblock-external-docs-wrapper {
          background-color: #fff;
          color: #374151;
        }
        .swagger-ui .parameter__name {
          color: #111827;
        }
        .swagger-ui .parameter__type {
          color: #6b7280;
        }
        .swagger-ui .response-col_status {
          color: #111827;
        }
        .swagger-ui .response-col_description {
          color: #374151;
        }
        .swagger-ui .btn {
          background-color: #3b82f6;
          color: #fff;
        }
        .swagger-ui .btn:hover {
          background-color: #2563eb;
        }
        .swagger-ui .btn.cancel {
          background-color: #6b7280;
        }
        .swagger-ui .btn.cancel:hover {
          background-color: #4b5563;
        }
        .swagger-ui input[type="text"],
        .swagger-ui input[type="email"],
        .swagger-ui input[type="password"],
        .swagger-ui textarea,
        .swagger-ui select {
          background-color: #fff;
          border-color: #d1d5db;
          color: #111827;
        }
        .swagger-ui .model-box {
          background-color: #fff;
          border: 1px solid #e5e7eb;
        }
        .swagger-ui .model-title {
          color: #111827;
        }
        .swagger-ui .prop-name {
          color: #111827;
        }
        .swagger-ui .prop-type {
          color: #6b7280;
        }
        .swagger-ui table thead tr th {
          background-color: #f9fafb;
          color: #111827;
          border-bottom: 1px solid #e5e7eb;
        }
        .swagger-ui table tbody tr td {
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        .swagger-ui .response-content-type {
          color: #6b7280;
        }
        .swagger-ui .highlight-code {
          background-color: #f9fafb;
        }
      `}</style>
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

