import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { searchPeopleAction, getMyConnectionsAction } from "@/actions/connection.actions";
import { messageClientService } from "@/services/message.client.service";
import type { Mock } from "vitest";
import { NewMessageModal } from "../new-message-modal";
import type { Conversation } from "@/types/message.types";
import type { ConnectionOtherUser } from "@/types/connection.types";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
Element.prototype.scrollIntoView = vi.fn();

vi.mock("@/actions/connection.actions", () => ({
  searchPeopleAction: vi.fn(),
  getMyConnectionsAction: vi.fn(),
}));

vi.mock("@/services/message.client.service", () => ({
  messageClientService: {
    createConversation: vi.fn(),
  },
}));

const ALICE: ConnectionOtherUser = {
  id: "u-2",
  name: "Alice Rahman",
  email: "alice@nub.ac.bd",
  image: null,
  student: { department: "CSE", admissionYear: 2024, admissionSemester: "SUMMER" },
};

const BOB: ConnectionOtherUser = {
  id: "u-3",
  name: "Bob Islam",
  email: "bob@nub.ac.bd",
  image: null,
  student: { department: "EEE", admissionYear: 2023, admissionSemester: "FALL" },
};

function renderModal(overrides: {
  existingConversationByUser?: Map<string, string>;
  onOpenConversation?: ReturnType<typeof vi.fn>;
  onStart?: ReturnType<typeof vi.fn>;
  onOpenChange?: ReturnType<typeof vi.fn>;
} = {}) {
  const onOpenChange = overrides.onOpenChange ?? vi.fn();
  const onStart = overrides.onStart ?? vi.fn();
  const onOpenConversation = overrides.onOpenConversation ?? vi.fn();
  render(
    <NewMessageModal
      open
      onOpenChange={onOpenChange}
      currentUserId="u-1"
      existingConversationByUser={
        overrides.existingConversationByUser ?? new Map<string, string>()
      }
      onStart={onStart}
      onOpenConversation={onOpenConversation}
    />,
  );
  return { onOpenChange, onStart, onOpenConversation };
}

describe("NewMessageModal", () => {
  beforeEach(() => {
    (searchPeopleAction as Mock).mockReset();
    (getMyConnectionsAction as Mock).mockReset();
    (messageClientService.createConversation as Mock).mockReset();
    (getMyConnectionsAction as Mock).mockResolvedValue({
      success: true,
      data: { data: [] },
    });
  });

  it("starts only one conversation when the row is tapped multiple times", async () => {
    const user = userEvent.setup();
    (searchPeopleAction as Mock).mockResolvedValue({
      success: true,
      data: { data: [ALICE] },
    });

    let resolveCreate!: (value: Conversation) => void;
    (messageClientService.createConversation as Mock).mockImplementation(
      () =>
        new Promise<Conversation>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const { onOpenChange, onStart } = renderModal();

    await user.type(
      screen.getByPlaceholderText("Search people by name..."),
      "Alice",
    );

    const firstRow = await screen.findByText("Alice Rahman");
    await user.click(firstRow.closest("button") as HTMLButtonElement);

    const disabledRow = screen.getByText("Alice Rahman");
    const disabledButton = disabledRow.closest("button") as HTMLButtonElement;
    await user.click(disabledButton);

    expect(messageClientService.createConversation).toHaveBeenCalledTimes(1);
    expect(messageClientService.createConversation).toHaveBeenCalledWith({
      participantId: "u-2",
    });

    resolveCreate({ id: "conv-1" } as Conversation);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onStart).toHaveBeenCalledWith({ id: "conv-1" });
  });

  it("re-enables the row after a failed create so the user can retry", async () => {
    const user = userEvent.setup();
    (searchPeopleAction as Mock).mockResolvedValue({
      success: true,
      data: { data: [ALICE] },
    });

    const createMock = messageClientService.createConversation as Mock;
    createMock
      .mockRejectedValueOnce(new Error("Server error"))
      .mockResolvedValueOnce({ id: "conv-2" } as Conversation);

    const { onStart } = renderModal();

    await user.type(
      screen.getByPlaceholderText("Search people by name..."),
      "Alice",
    );

    const row = await screen.findByText("Alice Rahman");
    const button = row.closest("button") as HTMLButtonElement;

    await user.click(button);
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(2));
    expect(onStart).toHaveBeenCalledWith({ id: "conv-2" });
  });

  it("shows connections without a conversation by default, and skips people already in a conversation", async () => {
    (getMyConnectionsAction as Mock).mockResolvedValue({
      success: true,
      data: {
        data: [
          { id: "conn-1", otherUser: ALICE },
          { id: "conn-2", otherUser: BOB },
        ],
      },
    });

    const existing = new Map<string, string>([[ALICE.id, "conv-existing"]]);
    renderModal({ existingConversationByUser: existing });

    await waitFor(() => expect(getMyConnectionsAction).toHaveBeenCalled());
    expect(screen.getByText("Your connections")).toBeInTheDocument();
    expect(screen.getByText("Bob Islam")).toBeInTheDocument();
    expect(screen.queryByText("Alice Rahman")).not.toBeInTheDocument();
  });

  it("shows an encouraging empty state when every connection is already in a conversation", async () => {
    (getMyConnectionsAction as Mock).mockResolvedValue({
      success: true,
      data: { data: [{ id: "conn-1", otherUser: ALICE }] },
    });

    const existing = new Map<string, string>([[ALICE.id, "conv-existing"]]);
    renderModal({ existingConversationByUser: existing });

    expect(
      await screen.findByText(
        "You've already started a chat with all your connections.",
      ),
    ).toBeInTheDocument();
  });

  it("opens the existing conversation instead of creating a duplicate when a searched person already has a chat", async () => {
    const user = userEvent.setup();
    (searchPeopleAction as Mock).mockResolvedValue({
      success: true,
      data: { data: [ALICE] },
    });

    const existing = new Map<string, string>([[ALICE.id, "conv-existing"]]);
    const { onOpenChange, onOpenConversation } = renderModal({
      existingConversationByUser: existing,
    });

    await user.type(
      screen.getByPlaceholderText("Search people by name..."),
      "Alice",
    );

    const row = await screen.findByText("Alice Rahman");
    await user.click(row.closest("button") as HTMLButtonElement);

    expect(messageClientService.createConversation).not.toHaveBeenCalled();
    expect(onOpenConversation).toHaveBeenCalledWith("conv-existing");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
