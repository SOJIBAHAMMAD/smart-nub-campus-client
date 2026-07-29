/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

/**
 * Horizontal, scrollable row of prompt suggestion chips.
 * Used in the main content area above the chat thread.
 */
export function QuickPrompts({ prompts, onSelect }: QuickPromptsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -240 : 240, behavior: "smooth" });
  };

  if (prompts.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => scrollBy("left")}
        aria-label="Scroll left"
        className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-background p-1 text-muted-foreground shadow-sm hover:text-foreground sm:block"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {prompts.map((prompt, i) => (
          <button
            key={`${prompt}-${i}`}
            onClick={() => onSelect(prompt)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground ring-1 ring-foreground/5 transition-colors hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
      <button
        onClick={() => scrollBy("right")}
        aria-label="Scroll right"
        className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-background p-1 text-muted-foreground shadow-sm hover:text-foreground sm:block"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
