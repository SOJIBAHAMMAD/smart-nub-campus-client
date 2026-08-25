"use client";

import { TrendingUp, HelpCircle, Clock, Wrench, Sparkles } from "lucide-react";
import type { AIStudyStats } from "@/types/ai.types";
import { Card, CardContent } from "@/components/ui/card";
import { aiComposer } from "@/components/ai/ai-composer-store";

interface AIRightPanelProps {
  studyStats: AIStudyStats | null;
}

const POPULAR_PROMPTS = [
  {
    prompt: "Explain linked lists vs arrays",
    description: "Data structures comparison",
  },
  {
    prompt: "Compare SQL vs NoSQL databases",
    description: "Database concepts",
  },
  {
    prompt: "Write a binary search in Python",
    description: "Algorithm implementation",
  },
  {
    prompt: "What is normalization in DBMS?",
    description: "Database design",
  },
  {
    prompt: "Explain OS deadlock handling",
    description: "Operating systems",
  },
];

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function AIRightPanel({ studyStats }: AIRightPanelProps) {
  const handlePrompt = (prompt: string) => {
    aiComposer.set(prompt.trim());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Popular Prompts
            </h3>
          </div>
          <div className="space-y-1.5">
            {POPULAR_PROMPTS.map((item) => (
              <button
                key={item.prompt}
                onClick={() => handlePrompt(item.prompt)}
                className="group flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-all hover:bg-muted"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary group-hover:bg-primary/20">
                  <TrendingUp className="size-3" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm leading-tight">{item.prompt}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Study Stats
          </h3>
          {studyStats ? (
            <div className="space-y-3">
              {[
                {
                  label: "Questions",
                  value: (studyStats.questionsAsked ?? 0).toString(),
                  icon: HelpCircle,
                  sublabel: "Total asked",
                },
                {
                  label: "Time Spent",
                  value: formatDuration(studyStats.timeSpentMinutes ?? 0),
                  icon: Clock,
                  sublabel: "This week",
                },
                {
                  label: "Tools Used",
                  value: (studyStats.quizzesGenerated ?? 0).toString(),
                  icon: Wrench,
                  sublabel: "Quizzes & more",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[11px] text-muted-foreground">
                      {item.label}
                      <span className="ml-1 text-[10px] text-muted-foreground/60">
                        {item.sublabel}
                      </span>
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Clock className="size-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                No stats available yet
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Start studying to see your progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
