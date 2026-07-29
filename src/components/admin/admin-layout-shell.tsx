"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IdentityMeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
  };
  student: Record<string, unknown> | null;
  admin: Record<string, unknown> | null;
}

/**
 * Client-side admin layout shell.
 * Handles fetching user identity and rendering the sidebar + content area.
 * Sidebar is responsive: fixed on desktop, slide-over on mobile.
 */
export function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Admin");
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await apiClient.get<{
          success: boolean;
          message: string;
          data: IdentityMeResponse;
        }>("/identity/me");

        if (response.data?.data) {
          setUserName(response.data.data.user.name);
          setUserImage(response.data.data.user.image ?? undefined);
        }
      } catch {
        // Proxy already guarantees only authenticated admins reach this layout.
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  /** Show loading state while fetching user info for the sidebar. */
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar skeleton */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-gray-900 lg:flex">
          <div className="flex h-16 items-center gap-2 border-b border-gray-700 px-6">
            <Skeleton className="size-8 rounded-lg bg-gray-700" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20 bg-gray-700" />
              <Skeleton className="h-3 w-24 bg-gray-700" />
            </div>
          </div>
          <div className="space-y-1 p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-full rounded-lg bg-gray-700"
              />
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 lg:ml-64 pt-16 p-6 overflow-y-auto">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar (mobile) */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-4 border-b bg-white px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
            A
          </div>
          <span className="text-sm font-semibold">Admin Panel</span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed on desktop, slide-over on mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <AdminSidebar
          userName={userName}
          userImage={userImage}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 h-screen pt-16 lg:pt-0 overflow-y-auto">{children}</main>
    </div>
  );
}
