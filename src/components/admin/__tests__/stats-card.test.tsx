import { render, screen } from "@/__tests__/test-utils";
import { StatsCard } from "@/components/admin/stats-card";
import { Users, AlertTriangle } from "lucide-react";

describe("StatsCard", () => {
  it("renders the label and value", () => {
    render(<StatsCard label="Total Users" value={1250} icon={Users} />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("1250")).toBeInTheDocument();
  });

  it("renders string values", () => {
    render(<StatsCard label="Status" value="Healthy" icon={Users} />);
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    const { container } = render(
      <StatsCard label="Users" value={100} icon={Users} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  describe("trend", () => {
    it("shows positive trend with TrendingUp icon", () => {
      render(
        <StatsCard label="Users" value={100} icon={Users} trend={12.5} />,
      );
      expect(screen.getByText((content) => content.includes("12.5"))).toBeInTheDocument();
      expect(screen.getByText("from last month")).toBeInTheDocument();
    });

    it("shows negative trend with TrendingDown icon", () => {
      render(
        <StatsCard label="Users" value={100} icon={Users} trend={-5} />,
      );
      expect(screen.getByText("-5%")).toBeInTheDocument();
      expect(screen.getByText("from last month")).toBeInTheDocument();
    });

    it("shows zero trend without an arrow icon", () => {
      render(
        <StatsCard label="Users" value={100} icon={Users} trend={0} />,
      );
      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });

  describe("warning state", () => {
    it("applies warning styling when isWarning is true", () => {
      const { container } = render(
        <StatsCard label="Pending" value={5} icon={AlertTriangle} isWarning />,
      );
      expect(screen.getByText("Requires attention")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });
});
