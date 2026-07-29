/**
 * Skip-to-content link for keyboard/screen-reader users.
 * Hidden by default, becomes visible on focus. Bypasses TopNav and focuses
 * the main content area when activated.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
