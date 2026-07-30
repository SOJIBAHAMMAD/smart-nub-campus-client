"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SummaryBlockProps {
  summary: string;
  keyPoints?: string[];
  title?: string;
}

export function SummaryBlock({ summary, keyPoints, title }: SummaryBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasKeyPoints = keyPoints && keyPoints.length > 0;

  return (
    <div className="my-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold">
            {title || "Summary"}
          </h4>
          <div className="prose prose-sm mt-2 max-w-none text-muted-foreground dark:prose-invert">
            <p className="leading-relaxed">{summary}</p>
          </div>

          {hasKeyPoints && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {isExpanded ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
                Key Points ({keyPoints.length})
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-1.5">
                  {keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                      <span className="leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
