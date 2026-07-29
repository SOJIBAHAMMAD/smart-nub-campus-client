import { render, screen } from "@/__tests__/test-utils";
import { DiscussionCard } from "@/components/discussions/discussion-card";
import { mockDiscussion } from "@/__tests__/mocks/data";
import type { Discussion } from "@/types/discussion.types";

const baseDiscussion: Discussion = {
  ...(mockDiscussion as unknown as Discussion),
  discussionTags: [],
};

describe("DiscussionCard", () => {
  it("renders the discussion title", () => {
    render(<DiscussionCard discussion={baseDiscussion} />);
    expect(screen.getByText("Test Discussion")).toBeInTheDocument();
  });

  it("links to the discussion detail page", () => {
    render(<DiscussionCard discussion={baseDiscussion} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/discussions/${baseDiscussion.id}`);
  });

  it("displays the category badge", () => {
    render(<DiscussionCard discussion={baseDiscussion} />);
    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("shows pinned badge when discussion is pinned", () => {
    const pinned = { ...baseDiscussion, isPinned: true };
    render(<DiscussionCard discussion={pinned} />);
    expect(screen.getByLabelText("Pinned")).toBeInTheDocument();
  });

  it("shows locked badge when discussion is locked", () => {
    const locked = { ...baseDiscussion, isLocked: true };
    render(<DiscussionCard discussion={locked} />);
    expect(screen.getByLabelText("Locked")).toBeInTheDocument();
  });

  it("shows solved badge when discussion is solved", () => {
    const solved = { ...baseDiscussion, isSolved: true };
    render(<DiscussionCard discussion={solved} />);
    expect(screen.getByLabelText("Solved")).toBeInTheDocument();
  });

  it("shows reply count", () => {
    render(<DiscussionCard discussion={baseDiscussion} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows view count", () => {
    render(<DiscussionCard discussion={baseDiscussion} />);
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("shows author name", () => {
    render(<DiscussionCard discussion={baseDiscussion} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("shows vote count", () => {
    render(
      <DiscussionCard discussion={baseDiscussion} onVote={vi.fn()} />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
