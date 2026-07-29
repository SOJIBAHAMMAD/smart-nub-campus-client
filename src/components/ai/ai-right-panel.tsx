/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { TrendingUp } from "lucide-react";
import type { AIStudyStats } from "@/types/ai.types";
import { Card, CardContent } from "@/components/ui/card";
import { StudyStats } from "@/components/ai/study-stats";
import { aiComposer } from "@/components/ai/ai-composer-store";

interface AIRightPanelProps {
  studyStats: AIStudyStats | null;
}

/** Top trending community prompts shown in the right panel. */
const POPULAR_PROMPTS = [
  "Explain linked lists vs arrays",
  "Compare SQL vs NoSQL databases",
  "Write a binary search in Python",
];

/**
 * Right sidebar for the AI Assistant page.
 * Shows popular prompts and the study stats card.
 * Prompt selection pre-fills the composer via a shared store.
 */
export function AIRightPanel({ studyStats }: AIRightPanelProps) {
  // Pre-fill the composer with the chosen prompt (does not send).
  // Uses a shared in-memory store so the address bar stays clean.
  const handlePrompt = (prompt: string) => {
    aiComposer.set(prompt.trim());
  };

  return (
    <div className="space-y-6">
      {/* ── Popular Prompts ─────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular Prompts
          </h3>
        </div>
        <ol className="space-y-2">
          {POPULAR_PROMPTS.map((prompt, i) => (
            <li key={prompt}>
                <button
                onClick={() => handlePrompt(prompt)}
                className="flex w-full items-start gap-2 text-left text-sm text-foreground transition-colors hover:text-primary"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="leading-snug">{prompt}</span>
              </button>
            </li>
          ))}
        </ol>
        </CardContent>
      </Card>

      {/* ── Study Stats ─────────────────────────────────────── */}
      <StudyStats stats={studyStats} />
    </div>
  );
}
