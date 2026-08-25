import { render, screen } from "@/__tests__/test-utils";
import type { Conversation } from "@/types/message.types";
import { ConversationItem } from "../conversation-item";

function createMockConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "conv-1",
    type: "DIRECT",
    name: null,
    description: null,
    groupImage: null,
    creatorId: "user-1",
    creator: { id: "user-1", name: "Alice" },
    lastMessageAt: new Date().toISOString(),
    lastMessage: {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-2",
      sender: { id: "user-2", name: "Bob" },
      content: "Hey, are you free?",
      type: "TEXT",
      fileUrl: null,
      filePublicId: null,
      fileName: null,
      fileSize: null,
      isRead: false,
      readAt: null,
      replyToId: null,
      replyTo: null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    conversationParticipants: [
      { id: "p-1", conversationId: "conv-1", userId: "user-1", user: { id: "user-1", name: "Alice" }, lastReadAt: null, isAdmin: false, isMuted: false, joinedAt: new Date().toISOString() },
      { id: "p-2", conversationId: "conv-1", userId: "user-2", user: { id: "user-2", name: "Bob" }, lastReadAt: null, isAdmin: false, isMuted: false, joinedAt: new Date().toISOString() },
    ],
    unreadCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("ConversationItem", () => {
  const defaultProps = {
    currentUserId: "user-1",
    active: false,
    onlineUsers: new Set<string>(),
    typing: false,
    onSelect: vi.fn(),
  };

  it("renders the other user name for direct conversations", () => {
    render(<ConversationItem conversation={createMockConversation()} {...defaultProps} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders last message preview text", () => {
    render(<ConversationItem conversation={createMockConversation()} {...defaultProps} />);
    expect(screen.getByText("Hey, are you free?")).toBeInTheDocument();
  });

  it("renders timestamp from lastMessageAt", () => {
    render(<ConversationItem conversation={createMockConversation()} {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("renders unread badge when there are unread messages", () => {
    render(<ConversationItem conversation={createMockConversation()} {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("does not render unread badge when count is zero", () => {
    render(<ConversationItem conversation={createMockConversation({ unreadCount: 0 })} {...defaultProps} />);
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  it("shows online status dot when the other user is online", () => {
    const onlineUsers = new Set(["user-2"]);
    render(<ConversationItem conversation={createMockConversation()} {...defaultProps} onlineUsers={onlineUsers} />);
    expect(screen.getByLabelText("Online")).toBeInTheDocument();
  });

  it("shows offline status dot when the other user is offline", () => {
    render(<ConversationItem conversation={createMockConversation()} {...defaultProps} />);
    expect(screen.getByLabelText("Offline")).toBeInTheDocument();
  });

  it("calls onSelect when clicked", () => {
    const onSelect = vi.fn();
    render(<ConversationItem conversation={createMockConversation()} {...defaultProps} onSelect={onSelect} />);
    screen.getByRole("button").click();
    expect(onSelect).toHaveBeenCalledWith("conv-1");
  });
});
