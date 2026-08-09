import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { getQuestion, listAnswers, listQuestions } from "@/actions/qa.actions";
import { mockQuestion } from "@/__tests__/mocks/data";
import type { Mock } from "vitest";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "88888888-8888-4888-8888-888888888888" }),
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
      data: { user: { id: "user-1", name: "Test User" } },
      isPending: false,
      error: null,
    }),
  },
}));

vi.mock("@/actions/qa.actions", () => ({
  getQuestion: vi.fn(),
  listAnswers: vi.fn(),
  listQuestions: vi.fn(),
  voteQuestion: vi.fn(),
  bookmarkQuestion: vi.fn(),
  postAnswer: vi.fn(),
  voteAnswer: vi.fn(),
  acceptAnswer: vi.fn(),
  updateAnswer: vi.fn(),
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

import QuestionDetailPage from "../page";

describe("QuestionDetailPage", () => {
  beforeEach(() => {
    (getQuestion as Mock).mockReset();
    (listAnswers as Mock).mockReset().mockResolvedValue({ success: true, data: [] });
    (listQuestions as Mock)
      .mockReset()
      .mockResolvedValue({ success: true, data: { data: [] } });
  });

  it("loads and renders the question", async () => {
    (getQuestion as Mock).mockResolvedValue({
      success: true,
      message: "",
      data: mockQuestion,
    });

    render(<QuestionDetailPage />);

    expect(
      await screen.findByRole("heading", { name: "How to sort an array?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Programming")).toBeInTheDocument();
    expect(screen.getByText("3 answers")).toBeInTheDocument();
    expect(screen.getByText("Your Answer")).toBeInTheDocument();
  });

  it("shows the error state with a link back to Q&A when loading fails", async () => {
    (getQuestion as Mock).mockResolvedValue({
      success: false,
      message: "Question not found.",
      data: null,
    });

    render(<QuestionDetailPage />);

    expect(await screen.findByText("Question not found.")).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: /Back to Q&A/i });
    expect(backLink).toHaveAttribute("href", "/qa");
  });
});
