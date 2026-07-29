import { render, screen } from "@/__tests__/test-utils";
import { ChatMessage } from "@/components/ai/chat-message";
import { mockChatMessage, mockChatMessageAI } from "@/__tests__/mocks/data";
import type { AIMessage } from "@/types/ai.types";

describe("ChatMessage", () => {
  describe("user message", () => {
    const userMsg = mockChatMessage as AIMessage;

    it("displays 'You' as the sender name", () => {
      render(<ChatMessage message={userMsg} />);
      expect(screen.getByText("You")).toBeInTheDocument();
    });

    it("renders user message content", () => {
      render(<ChatMessage message={userMsg} />);
      expect(screen.getByText("Hello AI!")).toBeInTheDocument();
    });

    it("does not render copy button for user messages", () => {
      render(<ChatMessage message={userMsg} />);
      expect(screen.queryByLabelText("Copy message")).not.toBeInTheDocument();
    });

    it("does not render like/dislike buttons for user messages", () => {
      render(<ChatMessage message={userMsg} />);
      expect(screen.queryByLabelText("Like message")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Dislike message")).not.toBeInTheDocument();
    });
  });

  describe("AI message", () => {
    const aiMsg = mockChatMessageAI as AIMessage;

    it("displays 'AI Assistant' as the sender name", () => {
      render(<ChatMessage message={aiMsg} />);
      expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    });

    it("renders AI message content", () => {
      render(<ChatMessage message={aiMsg} />);
      expect(screen.getByText("Hello! How can I help you?")).toBeInTheDocument();
    });

    it("renders a copy button", () => {
      render(<ChatMessage message={aiMsg} />);
      expect(screen.getByLabelText("Copy message")).toBeInTheDocument();
    });

    it("renders like button", () => {
      render(<ChatMessage message={aiMsg} />);
      expect(screen.getByLabelText("Like message")).toBeInTheDocument();
    });

    it("renders dislike button", () => {
      render(<ChatMessage message={aiMsg} />);
      expect(screen.getByLabelText("Dislike message")).toBeInTheDocument();
    });
  });
});
