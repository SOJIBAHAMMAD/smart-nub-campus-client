import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Smart NUB Campus",
  description: "View team details on Smart NUB Campus.",
};

export default function TeamDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
