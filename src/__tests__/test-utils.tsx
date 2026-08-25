import { render, type RenderOptions } from "@testing-library/react";
import { forwardRef, type ReactNode } from "react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useSelectedLayoutSegment: () => null,
}));

vi.mock("next/link", () => {
  const MockLink = forwardRef(function Link(
    { children, href, ...props }: Record<string, unknown>,
    ref: React.Ref<HTMLAnchorElement>,
  ) {
    return (
      <a ref={ref} href={href as string} {...props}>
        {children}
      </a>
    );
  });
  MockLink.displayName = "Link";
  return { default: MockLink };
});

vi.mock("next/image", () => {
  const MockImage = (props: Record<string, unknown>) => {
    const { priority: _priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt="" />;
  };
  MockImage.displayName = "Image";
  return { default: MockImage };
});

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("@/hooks/use-unread-count", () => ({
  useUnreadCount: () => ({ count: 0, isLoading: false, refresh: vi.fn(), decrement: vi.fn(), reset: vi.fn() }),
}));

vi.mock("@/hooks/use-socket", () => ({
  useSocket: () => ({ socket: null, isConnected: false, status: "disconnected", connect: vi.fn(), disconnect: vi.fn() }),
  useSocketEvent: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
    postForm: vi.fn(),
  },
}));

vi.mock("@/lib/server-api", () => ({
  serverApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
    put: vi.fn(),
    postForm: vi.fn(),
  },
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: { emailOtp: vi.fn() },
    signOut: { signOut: vi.fn() },
  },
}));

vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return { ...actual };
});

function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
