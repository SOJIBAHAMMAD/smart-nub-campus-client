import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Question | Smart NUB Campus",
  description: "View question on Smart NUB Campus.",
};

export default function QuestionDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
