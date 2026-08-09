import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { qaService } from "@/services/qa.service";
import { resourceService } from "@/services/resource.service";
import type { Mock } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/qa/ask",
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

vi.mock("@/services/qa.service", () => ({
  qaService: {
    listCategories: vi.fn(),
    listTags: vi.fn(),
  },
}));

vi.mock("@/services/resource.service", () => ({
  resourceService: {
    listCourses: vi.fn(),
  },
}));

vi.mock("@/actions/qa.actions", () => ({
  createQuestion: vi.fn(),
}));

vi.mock("@/hooks/use-tags", () => ({
  useTags: () => ({
    tags: [],
    filteredTags: [],
    search: "",
    setSearch: vi.fn(),
    createTag: vi.fn(),
    isLoading: false,
    isCreating: false,
  }),
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

import AskQuestionPage from "../page";

const CATEGORY = {
  id: "cat-1",
  name: "Programming",
  slug: "programming",
  color: "#10b981",
  _count: { questions: 3 },
};
const TAG = {
  id: "tag-1",
  name: "JavaScript",
  slug: "javascript",
  _count: { questionTags: 1 },
};
const COURSE = {
  id: "course-1",
  code: "CSE101",
  name: "Intro to Programming",
};

async function renderPage() {
  const element = await AskQuestionPage();
  return render(element);
}

describe("AskQuestionPage", () => {
  beforeEach(() => {
    (qaService.listCategories as Mock).mockReset();
    (qaService.listTags as Mock).mockReset();
    (resourceService.listCourses as Mock).mockReset();
    window.localStorage.clear();
  });

  it("renders the ask question form inside the Suspense boundary", async () => {
    (qaService.listCategories as Mock).mockResolvedValue([CATEGORY]);
    (qaService.listTags as Mock).mockResolvedValue([TAG]);
    (resourceService.listCourses as Mock).mockResolvedValue([COURSE]);

    await renderPage();

    expect(screen.getByRole("heading", { name: "Ask a Question" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("e.g., How to implement a B-tree in C++?"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Describe your question in detail. You can use rich formatting...",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Post Question/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search or create tags..."),
    ).toBeInTheDocument();
  });

  it("still renders the form with empty selects when the data fetch fails", async () => {
    (qaService.listCategories as Mock).mockRejectedValue(new Error("boom"));
    (qaService.listTags as Mock).mockRejectedValue(new Error("boom"));
    (resourceService.listCourses as Mock).mockRejectedValue(new Error("boom"));

    await renderPage();

    expect(screen.getByRole("heading", { name: "Ask a Question" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Post Question/i })).toBeInTheDocument();
    expect(screen.getByText("Select a category")).toBeInTheDocument();
  });
});
