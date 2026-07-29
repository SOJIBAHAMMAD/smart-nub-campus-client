/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { HelpCircle, Clock, Wrench } from "lucide-react";
import type { AIStudyStats } from "@/types/ai.types";
import { Card, CardContent } from "@/components/ui/card";

interface StudyStatsProps {
  stats: AIStudyStats | null;
}

/** Format minutes into a friendly "Xh Ym" duration string. */
function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/**
 * Card showing the user's weekly AI study statistics:
 * questions asked, time spent, and tools used (quizzes generated).
 */
export function StudyStats({ stats }: StudyStatsProps) {
  const questions = stats?.questionsAsked ?? 0;
  const timeSpent = formatDuration(stats?.timeSpentMinutes ?? 0);
  const toolsUsed = stats?.quizzesGenerated ?? 0;

  const items = [
    {
      label: "Questions",
      value: questions.toString(),
      icon: HelpCircle,
    },
    {
      label: "Time Spent",
      value: timeSpent,
      icon: Clock,
    },
    {
      label: "Tools Used",
      value: toolsUsed.toString(),
      icon: Wrench,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Study Stats
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}
