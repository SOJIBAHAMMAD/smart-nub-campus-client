import { render, screen } from "@/__tests__/test-utils";
import { ResourceCard } from "@/components/resources/resource-card";
import { mockResource } from "@/__tests__/mocks/data";
import type { Resource } from "@/types/resource.types";

const resource: Resource = {
  ...(mockResource as Resource),
  resourceTags: [
    {
      id: "tag-assoc-1",
      resourceId: mockResource.id,
      tagId: "55555555-5555-4555-8555-555555555555",
      tag: { id: "55555555-5555-4555-8555-555555555555", name: "JavaScript", slug: "javascript" },
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ],
  isVerified: false,
};

describe("ResourceCard", () => {
  it("renders the resource title", () => {
    render(<ResourceCard resource={resource} />);
    expect(screen.getByText("Test Resource")).toBeInTheDocument();
  });

  it("links to the resource detail page", () => {
    render(<ResourceCard resource={resource} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/resources/${resource.id}`);
  });

  it("displays course code and name", () => {
    render(<ResourceCard resource={resource} />);
    expect(screen.getByText(/CSE101/)).toBeInTheDocument();
    expect(screen.getByText(/Intro to Programming/)).toBeInTheDocument();
  });

  it("shows the uploader name", () => {
    render(<ResourceCard resource={resource} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("shows the upvote count", () => {
    render(<ResourceCard resource={resource} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
