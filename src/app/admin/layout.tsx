import type { Metadata } from "next";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard | Smart NUB Campus",
  description: "Platform administration panel for Smart NUB Campus.",
};

/**
 * Admin route group layout.
 * Server component that exports metadata and wraps the client layout shell.
 * The client shell handles user identity fetching and sidebar rendering.
 *
 * Auth and role-based access is handled centrally by the proxy (src/proxy.ts).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
