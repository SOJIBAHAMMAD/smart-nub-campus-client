import type { Metadata } from "next";
import AIPageContent from "@/components/ai/ai-page-content";

export const metadata: Metadata = {
  title: "AI Assistant | Smart NUB Campus",
  description:
    "AI-powered study tools — PDF summarizer, quiz generator, flashcards and more for NUB students.",
  openGraph: {
    title: "AI Assistant | Smart NUB Campus",
    description: "AI-powered study tools for NUB students.",
    type: "website",
  },
};

export default async function AIPageSlug({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const activeSessionId =
    slug?.[0] ?? (typeof search.chat === "string" ? search.chat : undefined);

  return <AIPageContent activeSessionId={activeSessionId} />;
}
