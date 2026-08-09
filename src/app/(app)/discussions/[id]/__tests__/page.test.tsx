import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  getDiscussion,
  listDiscussions,
  listReplies,
} from "@/actions/discussion.actions";
import { mockDiscussion } from "@/__tests__/mocks/data";
import type { Mock } from "vitest";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "66666666-6666-4666-8666-666666666666" }),
}));

vi.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "Link";
  return { default: MockLink };
});

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: "user-1", name: "Test User", role: "STUDENT" } },
      isPending: false,
      error: null,
    }),
  },
}));

vi.mock("@/actions/discussion.actions", () => ({
  getDiscussion: vi.fn(),
  listDiscussions: vi.fn(),
  listReplies: vi.fn(),
  voteDiscussion: vi.fn(),
  bookmarkDiscussion: vi.fn(),
  postDiscussionReply: vi.fn(),
  voteReply: vi.fn(),
  togglePin: vi.fn(),
  toggleLock: vi.fn(),
  acceptAnswer: vi.fn(),
  reportReply: vi.fn(),
  editReply: vi.fn(),
}));

vi.mock("@/hooks/use-socket", () => ({
  useSocket: () => ({
    socket: null,
    isConnected: false,
    status: "disconnected",
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  useSocketEvent: vi.fn(),
}));

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_BACKEND_URL: "https://api.example.com",
    NEXT_PUBLIC_FRONTEND_URL: "https://example.com",
    NEXT_PUBLIC_API_URL: "https://api.example.com",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "test",
  },
}));

vi.mock("@/components/ui/rich-text-editor", () => ({
  RichTextEditor: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      data-testid="rich-text-editor"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
  RichTextEditorToolbar: () => null,
  RichTextEditorContent: () => null,
}));

import DiscussionDetailPage from "../page";

describe("DiscussionDetailPage", () => {
  beforeEach(() => {
    (getDiscussion as Mock).mockReset();
    (listReplies as Mock)
      .mockReset()
      .mockResolvedValue({ success: true, data: { replies: [] } });
    (listDiscussions as Mock)
      .mockReset()
      .mockResolvedValue({ success: true, data: { data: [] } });
  });

  it("loads and renders the discussion", async () => {
    (getDiscussion as Mock).mockResolvedValue({
      success: true,
      message: "",
      data: mockDiscussion,
    });

    render(<DiscussionDetailPage />);

    expect(
      await screen.findByRole("heading", { name: "Test Discussion" }),
    ).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Replies (5)")).toBeInTheDocument();
    expect(screen.getByText("Post a Reply")).toBeInTheDocument();
  });

  it("shows the error state with a link back to discussions when loading fails", async () => {
    (getDiscussion as Mock).mockResolvedValue({
      success: false,
      message: "Discussion not found.",
      data: null,
    });

    render(<DiscussionDetailPage />);

    expect(await screen.findByText("Discussion not found.")).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: /Back to Discussions/i });
    expect(backLink).toHaveAttribute("href", "/discussions");
  });
});
