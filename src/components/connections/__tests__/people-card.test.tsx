import { render, screen } from "@/__tests__/test-utils";
import { PeopleCard, type PeopleCardUser } from "../people-card";

function createUser(overrides: Partial<PeopleCardUser> = {}): PeopleCardUser {
  return {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    image: null,
    department: "Computer Science",
    currentSemester: 4,
    connectionStatus: "NONE",
    connectionId: null,
    ...overrides,
  };
}

describe("PeopleCard", () => {
  it("renders the person name", () => {
    render(<PeopleCard user={createUser()} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders department info", () => {
    render(<PeopleCard user={createUser()} />);
    expect(screen.getByText(/Computer Science/)).toBeInTheDocument();
  });

  it("renders the semester info", () => {
    render(<PeopleCard user={createUser()} />);
    expect(screen.getByText(/Sem 4/)).toBeInTheDocument();
  });

  it("shows Connect button when status is none", () => {
    render(<PeopleCard user={createUser()} />);
    expect(screen.getByRole("button", { name: /Connect/i })).toBeInTheDocument();
  });

  it("shows Accept and Decline buttons for pending incoming", () => {
    const user = createUser({ connectionStatus: "PENDING_INCOMING", connectionId: "conn-1" });
    render(<PeopleCard user={user} relationship="pending_incoming" direction="incoming" connectionId="conn-1" />);
    expect(screen.getByRole("button", { name: /Accept/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Decline/i })).toBeInTheDocument();
  });

  it("shows Cancel Request button for pending outgoing", () => {
    const user = createUser({ connectionStatus: "PENDING_OUTGOING", connectionId: "conn-2" });
    render(<PeopleCard user={user} relationship="pending_outgoing" direction="outgoing" connectionId="conn-2" />);
    expect(screen.getByRole("button", { name: /Cancel Request/i })).toBeInTheDocument();
  });

  it("shows Connected badge for connected status", () => {
    const user = createUser({ connectionStatus: "CONNECTED", connectionId: "conn-3" });
    render(<PeopleCard user={user} relationship="connected" direction="none" connectionId="conn-3" />);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("shows Message button for connected status", () => {
    const user = createUser({ connectionStatus: "CONNECTED", connectionId: "conn-3" });
    render(<PeopleCard user={user} relationship="connected" connectionId="conn-3" />);
    expect(screen.getByRole("button", { name: /Message/i })).toBeInTheDocument();
  });

  it("shows Remove button for connected status", () => {
    const user = createUser({ connectionStatus: "CONNECTED", connectionId: "conn-3" });
    render(<PeopleCard user={user} relationship="connected" connectionId="conn-3" />);
    expect(screen.getByRole("button", { name: /Remove connection/i })).toBeInTheDocument();
  });

  it("renders avatar with user name initials fallback", () => {
    render(<PeopleCard user={createUser()} />);
    const avatar = screen.getByText("JD");
    expect(avatar).toBeInTheDocument();
  });
});
