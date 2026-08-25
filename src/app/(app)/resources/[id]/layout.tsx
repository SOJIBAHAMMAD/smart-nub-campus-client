import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resource | Smart NUB Campus",
  description: "View resource details on Smart NUB Campus.",
};

export default function ResourceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
