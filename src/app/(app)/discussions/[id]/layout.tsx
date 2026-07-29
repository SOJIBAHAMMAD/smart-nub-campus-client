import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discussion | Smart NUB Campus",
  description: "View discussion on Smart NUB Campus.",
};

export default function DiscussionDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
