import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "../message-input";

describe("MessageInput", () => {
  it("renders the textarea input field", () => {
    render(<MessageInput onSend={vi.fn()} />);
    const textarea = screen.getByPlaceholderText("Type a message...");
    expect(textarea).toBeInTheDocument();
  });

  it("renders the send button", () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(screen.getByLabelText("Send message")).toBeInTheDocument();
  });

  it("renders the file attachment button", () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(screen.getByLabelText("Attach file")).toBeInTheDocument();
  });

  it("accepts text input", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={vi.fn()} />);
    const textarea = screen.getByPlaceholderText("Type a message...");
    await user.type(textarea, "Hello, World!");
    expect(textarea).toHaveValue("Hello, World!");
  });

  it("renders the emoji button", () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(screen.getByLabelText("Add emoji")).toBeInTheDocument();
  });
});
