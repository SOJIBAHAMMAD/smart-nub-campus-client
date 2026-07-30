import { render, screen, within } from "@/__tests__/test-utils";
import * as nextNavigation from "next/navigation";
import { TopNav } from "../top-nav";

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
    render(<TopNav />);
    expect(screen.getByText("Smart NUB")).toBeInTheDocument();
    expect(screen.getByText("Campus")).toBeInTheDocument();
  });

  it("renders primary navigation links", () => {
    render(<TopNav />);
    const nav = getDesktopNav();
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(5);
    const labels = ["Home", "Resources", "Teams", "My Network", "Messages"];
    for (const label of labels) {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    }
  });

  it("renders a More dropdown with secondary links", () => {
    render(<TopNav />);
    const nav = getDesktopNav();
    expect(within(nav).getByText("More")).toBeInTheDocument();
  });

  it("renders a search input", () => {
    render(<TopNav />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    render(<TopNav />);
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });

  it("renders the notifications bell", () => {
    render(<TopNav />);
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("renders the user initial when no image is provided", () => {
    render(<TopNav userName="Alice" />);
    const avatars = screen.getAllByText("A");
    expect(avatars.length).toBeGreaterThan(0);
  });

  it("renders the mobile search button", () => {
    render(<TopNav />);
    expect(
      screen.getByRole("button", { name: /open search/i }),
    ).toBeInTheDocument();
  });

  describe("active link highlighting", () => {
    it("highlights Home on the root path", () => {
      vi.spyOn(nextNavigation, "usePathname").mockReturnValue("/");
      render(<TopNav />);
      const nav = getDesktopNav();
      const homeLink = within(nav).getByRole("link", { name: /^Home$/ });
      expect(homeLink.className).toContain("text-primary");
    });

    it("highlights Resources on /resources", () => {
      vi.spyOn(nextNavigation, "usePathname").mockReturnValue("/resources");
      render(<TopNav />);
      const nav = getDesktopNav();
      const resourcesLink = within(nav).getByRole("link", { name: /^Resources$/ });
      expect(resourcesLink.className).toContain("text-primary");
      const homeLink = within(nav).getByRole("link", { name: /^Home$/ });
      expect(homeLink.className).toContain("text-muted-foreground");
    });
  });
});
