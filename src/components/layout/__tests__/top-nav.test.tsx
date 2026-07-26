import { render, screen, within } from "@/__tests__/test-utils";
import * as nextNavigation from "next/navigation";
import { TopNav } from "../top-nav";

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

  it("renders all navigation links", () => {
    render(<TopNav />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(8);
    const labels = ["Home", "Resources", "Teams", "Discussions", "Q&A", "AI Assistant", "My Network", "Messages"];
    for (const label of labels) {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    }
  });

  it("renders a search input", () => {
    render(<TopNav />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    render(<TopNav />);
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it("renders the notifications bell", () => {
    render(<TopNav />);
    expect(screen.getByRole("link", { name: /notifications/i })).toBeInTheDocument();
  });

  it("renders the user initial when no image is provided", () => {
    render(<TopNav userName="Alice" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders a default initial when no user name is provided", () => {
    render(<TopNav />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("renders the mobile menu toggle button", () => {
    render(<TopNav />);
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
  });

  describe("active link highlighting", () => {
    it("highlights Home on the root path", () => {
      vi.spyOn(nextNavigation, "usePathname").mockReturnValue("/");
      render(<TopNav />);
      const homeLink = screen.getByRole("link", { name: /^Home$/ });
      expect(homeLink.className).toContain("text-primary bg-primary/10");
    });

    it("highlights Resources on /resources", () => {
      vi.spyOn(nextNavigation, "usePathname").mockReturnValue("/resources");
      render(<TopNav />);
      const resourcesLink = screen.getByRole("link", { name: /^Resources$/ });
      expect(resourcesLink.className).toContain("text-primary bg-primary/10");
      const homeLink = screen.getByRole("link", { name: /^Home$/ });
      expect(homeLink.className).toContain("text-muted-foreground");
    });
  });
});
