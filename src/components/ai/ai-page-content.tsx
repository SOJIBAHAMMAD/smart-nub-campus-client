import { Suspense } from "react";
import { aiService } from "@/services/ai.service";
import { PageLayout } from "@/components/layout/page-layout";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import { AISidebar } from "@/components/ai/ai-sidebar";
import { AIRightPanel } from "@/components/ai/ai-right-panel";
import { AIClient } from "@/components/ai/ai-client";
import type { AIChatSession, AIMessage, AIStudyStats } from "@/types/ai.types";

export default async function AIPageContent({
  activeSessionId: explicitSessionId,
}: {
  activeSessionId?: string | null;
}) {
  const activeSessionId = explicitSessionId ?? null;

  let sessions: AIChatSession[] = [];
  let studyStats: AIStudyStats | null = null;
  let activeSession: (AIChatSession & { aiMessages: AIMessage[] }) | null = null;
  let resolvedActiveSessionId: string | null = activeSessionId;

  try {
    const [sessionsResult, statsResult] = await Promise.all([
      aiService.listSessions({ limit: 50 }),
      aiService.getStudyStats() as Promise<AIStudyStats>,
    ]);

    sessions = (sessionsResult.sessions ?? []) as AIChatSession[];
    studyStats = statsResult ?? null;
  } catch {}

  if (
    resolvedActiveSessionId &&
    sessions.some((s) => s.id === resolvedActiveSessionId)
  ) {
    try {
      activeSession = (await aiService.getSessionById(
        resolvedActiveSessionId,
      )) as AIChatSession & { aiMessages: AIMessage[] };
    } catch {
      resolvedActiveSessionId = null;
    }
  } else {
    resolvedActiveSessionId = null;
  }

  const initialMessages: AIMessage[] = activeSession?.aiMessages ?? [];

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <PageLayout
        leftSidebar={
          <AISidebar
            sessions={sessions}
            activeSessionId={resolvedActiveSessionId}
          />
        }
        rightSidebar={<AIRightPanel studyStats={studyStats} />}
        leftSidebarTitle="AI Tools"
        rightSidebarTitle="Prompts & Stats"
      >
        <AIClient
          initialSessions={sessions}
          initialMessages={initialMessages}
          initialActiveSessionId={resolvedActiveSessionId}
        />
      </PageLayout>
    </Suspense>
  );
}
