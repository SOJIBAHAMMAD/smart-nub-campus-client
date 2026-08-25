import type { Metadata } from "next";
import { Suspense } from "react";
import { serverApi } from "@/lib/server-api";
import { messageService } from "@/services/message.service";
import { MessagesPageClient } from "@/components/messages/messages-page-client";
import type { Conversation } from "@/types/message.types";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { conversationId } = await params;
  return {
    title: `Chat | Smart NUB Campus`,
    description: `Conversation ${conversationId}`,
  };
}

/**
 * Conversation page — renders the full chat view with conversation list sidebar.
 * The conversationId comes from the URL path segment.
 */
export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;

  let currentUserId = "";
  let initialConversations: Conversation[] = [];
  // null = validation request itself failed (show client fallback, don't 404).
  let conversationExists: boolean | null = null;

  try {
    const me = await serverApi.get<{ user: { id: string } }>("/identity/me", {
      cache: "no-store",
    });
    currentUserId = me.data?.user?.id ?? "";

    const res = await messageService.listConversations({ limit: 50 });
    initialConversations = res.conversations ?? [];

    // Validate the conversation exists and the user is a participant. Looking
    // it up directly avoids a false 404 for conversations that fall outside
    // the first page of the conversation list.
    const single = await messageService
      .getConversationById(conversationId)
      .catch((err: unknown) => {
        const status = (err as { status?: number })?.status;
        if (status === 404 || status === 403) return null;
        throw err;
      });
    conversationExists = single !== null;
    if (single && !initialConversations.some((c) => c.id === conversationId)) {
      initialConversations = [single, ...initialConversations];
    }
  } catch {
    // Client handles empty/error state gracefully.
  }

  if (conversationExists === false) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <MessagesPageClient
        currentUserId={currentUserId}
        initialConversations={initialConversations}
        activeConversationId={conversationId}
      />
    </Suspense>
  );
}
