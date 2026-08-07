import { TopNav } from "./top-nav";
import { SkipToContent } from "@/components/skip-to-content";

interface AppLayoutProps {
  children: React.ReactNode;
  /** Current user's display name. */
  userName?: string;
  /** Current user's avatar URL. */
  userImage?: string;
  /** Current user's ID for profile link. */
  userId?: string;
  /** Current user's role (e.g. STUDENT, ALUMNI, ADMIN). */
  userRole?: string;
}

/**
 * The main app shell that combines the horizontal TopNav with page content.
 * Used by authenticated route layouts.
 *
 * Includes a skip-to-content link for keyboard/screen-reader users.
 */
export function AppLayout({
  children,
  userName,
  userImage,
  userId,
  userRole,
}: AppLayoutProps) {
  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-background">
      <SkipToContent />
      <TopNav
        userName={userName}
        userImage={userImage}
        userId={userId}
        userRole={userRole}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-thin pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
      >
        {children}
      </main>
    </div>
  );
}
