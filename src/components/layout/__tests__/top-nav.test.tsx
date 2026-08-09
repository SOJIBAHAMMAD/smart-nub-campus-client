import { render, screen, within, act } from "@/__tests__/test-utils";
import * as nextNavigation from "next/navigation";
import { TopNav } from "../top-nav";
import { GlobalSearchProvider } from "@/providers/global-search-provider";
import { useGlobalSearch } from "@/hooks/use-global-search";

function SearchStateProbe() {
  const { isOpen } = useGlobalSearch();
  return <span data-testid="search-open">{isOpen ? "open" : "closed"}</span>;
}

function renderTopNav(props: Parameters<typeof TopNav>[0] = {}) {
  return render(
    <GlobalSearchProvider>
      <TopNav {...props} />
    </GlobalSearchProvider>,
  );
}

function renderTopNavWithProbe(props: Parameters<typeof TopNav>[0] = {}) {
  return render(
    <GlobalSearchProvider>
      <TopNav {...props} />
      <SearchStateProbe />
    </GlobalSearchProvider>,
  );
}

function getDesktopNav() {
  const navs = screen.getAllByRole("navigation", { name: "Main navigation" });
  return navs[0];
}

describe("TopNav", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(nextNavigation, "usePathname").mockReturnValue("/");
  });

  it("renders the brand name", () => {
    renderTopNav();
    expect(screen.getByText("Smart NUB")).toBeInTheDocument();
    expect(screen.getByText("Campus")).toBeInTheDocument();
  });

  it("renders primary navigation links", () => {
    renderTopNav();
    const nav = getDesktopNav();
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(5);
    const labels = ["Home", "Resources", "Teams", "My Network", "Messages"];
    for (const label of labels) {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    }
  });

  it("renders a More dropdown with secondary links", () => {
    renderTopNav();
    const nav = getDesktopNav();
    expect(within(nav).getByText("More")).toBeInTheDocument();
  });

  it("renders the desktop search trigger with a ⌘K hint", () => {
    renderTopNav();
    expect(
      screen.getByRole("button", { name: /open global search/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("⌘")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("opens the global search dialog when the desktop trigger is clicked", () => {
    renderTopNavWithProbe();
    expect(screen.getByTestId("search-open")).toHaveTextContent("closed");
    act(() => {
      screen
        .getByRole("button", { name: /open global search/i })
        .click();
    });
    expect(screen.getByTestId("search-open")).toHaveTextContent("open");
  });

  it("renders the theme toggle button", () => {
    renderTopNav();
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it("renders the notifications bell", () => {
    renderTopNav();
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("renders the user initial when no image is provided", () => {
    renderTopNav({ userName: "Alice" });
    const avatars = screen.getAllByText("A");
    expect(avatars.length).toBeGreaterThan(0);
  });

  it("renders the mobile search button", () => {
    renderTopNav();
    expect(
      screen.getByRole("button", { name: /open search/i }),
    ).toBeInTheDocument();
  });

  it("opens the global search dialog when the mobile search button is clicked", () => {
    renderTopNavWithProbe();
    act(() => {
      screen.getByRole("button", { name: /open search/i }).click();
    });
    expect(screen.getByTestId("search-open")).toHaveTextContent("open");
  });

  describe("active link highlighting", () => {
    it("highlights Home on the root path", () => {
      vi.spyOn(nextNavigation, "usePathname").mockReturnValue("/");
      renderTopNav();
      const nav = getDesktopNav();
      const homeLink = within(nav).getByRole("link", { name: /^Home$/ });
      expect(homeLink.className).toContain("text-primary");
    });

    it("highlights Resources on /resources", () => {
      vi.spyOn(nextNavigation, "usePathname").mockReturnValue("/resources");
      renderTopNav();
      const nav = getDesktopNav();
      const resourcesLink = within(nav).getByRole("link", { name: /^Resources$/ });
      expect(resourcesLink.className).toContain("text-primary");
      const homeLink = within(nav).getByRole("link", { name: /^Home$/ });
      expect(homeLink.className).toContain("text-muted-foreground");
    });
  });
});
