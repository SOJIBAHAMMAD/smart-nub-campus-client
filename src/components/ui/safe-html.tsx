import { useMemo } from "react"
import DOMPurify from "dompurify"

import { cn } from "@/lib/utils"

export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })

function SafeHTML({ html, className }: { html: string; className?: string }) {
  const sanitized = useMemo(() => sanitizeHtml(html), [html])

  return <div className={cn(className)} dangerouslySetInnerHTML={{ __html: sanitized }} />
}

export { SafeHTML }
