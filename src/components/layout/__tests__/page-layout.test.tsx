import { render, screen } from "@/__tests__/test-utils";
import { PageLayout } from "../page-layout";

describe("PageLayout", () => {
  it("renders a 3-column grid when both sidebars are provided", () => {
    const { container } = render(
      <PageLayout leftSidebar={<div>Left</div>} rightSidebar={<div>Right</div>}>
        <div>Main Content</div>
      </PageLayout>,
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer).toBeInTheDocument();
    const grid = outer.firstChild as HTMLElement;
    expect(grid.className).toContain("lg:grid-cols-[240px_1fr_240px]");
    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
  });

  it("renders a 2-column grid with only the left sidebar", () => {
    const { container } = render(
      <PageLayout leftSidebar={<div>Left</div>}>
        <div>Main Content</div>
      </PageLayout>,
    );
    const outer = container.firstChild as HTMLElement;
    const grid = outer.firstChild as HTMLElement;
    expect(grid.className).toContain("lg:grid-cols-[240px_1fr]");
    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.queryByText("Right")).not.toBeInTheDocument();
  });

  it("renders a 2-column grid with only the right sidebar", () => {
    const { container } = render(
      <PageLayout rightSidebar={<div>Right</div>}>
        <div>Main Content</div>
      </PageLayout>,
    );
    const outer = container.firstChild as HTMLElement;
    const grid = outer.firstChild as HTMLElement;
    expect(grid.className).toContain("lg:grid-cols-[1fr_240px]");
    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(screen.queryByText("Left")).not.toBeInTheDocument();
  });

  it("renders a single column when no sidebars are provided", () => {
    const { container } = render(
      <PageLayout>
        <div>Main Content</div>
      </PageLayout>,
    );
    const outer = container.firstChild as HTMLElement;
    const grid = outer.firstChild as HTMLElement;
    expect(grid.className).toContain("grid-cols-1");
    expect(screen.getByText("Main Content")).toBeInTheDocument();
    expect(screen.queryByText("Left")).not.toBeInTheDocument();
    expect(screen.queryByText("Right")).not.toBeInTheDocument();
  });

  it("always renders the main content", () => {
    render(
      <PageLayout>
        <div>Primary Content</div>
      </PageLayout>,
    );
    expect(screen.getByText("Primary Content")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("hides sidebars on small screens with hidden lg:block", () => {
    render(
      <PageLayout leftSidebar={<div>Left</div>} rightSidebar={<div>Right</div>}>
        <div>Main</div>
      </PageLayout>,
    );
    const asides = screen.getAllByRole("complementary");
    expect(asides).toHaveLength(2);
    for (const aside of asides) {
      expect(aside.className).toContain("hidden lg:block");
    }
  });
});
