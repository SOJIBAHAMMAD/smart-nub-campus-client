import type { Metadata } from "next";
import { Suspense } from "react";
import { serverApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Messages | Smart NUB Campus",
  description:
    "Chat with peers, send direct messages and coordinate with your teams at Northern University Bangladesh.",
  openGraph: {
    title: "Messages | Smart NUB Campus",
    description: "Chat with peers at Northern University Bangladesh.",
    type: "website",
  },
};
import { MessagesPageClient } from "@/components/messages/messages-page-client";
import { messageService } from "@/services/message.service";
import type { Conversation } from "@/types/message.types";

/**
 * Messages page — uses a CUSTOM 4-column layout (NOT PageLayout).
 *
 * The (app) group layout already provides the TopNav shell, so this page
 * only renders the bespoke MessagesPageClient which manages the sidebar,
 * conversation list, chat thread, and profile panel.
 *
 * Server-side we prefetch the current user id and the initial conversation
 * list so the first paint is meaningful; realtime updates happen client-side.
 */
export default async function MessagesPage() {
  let currentUserId = "";
  let initialConversations: Conversation[] = [];

  try {
    const me = await serverApi.get<{ user: { id: string } }>("/identity/me", {
      cache: "no-store",
    });
    currentUserId = me.data?.user?.id ?? "";

    const res = await messageService.listConversations({ limit: 50 });
    initialConversations = res.conversations ?? [];
  } catch {
    // Client handles empty/error state gracefully.
  }

  return (
    <Suspense fallback={null}>
      <MessagesPageClient
        currentUserId={currentUserId}
        initialConversations={initialConversations}
      />
    </Suspense>
  );
}
