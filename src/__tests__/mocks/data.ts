export const mockUser = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Test User",
  email: "test@example.com",
  image: null,
  role: "STUDENT" as const,
};

export const mockResource = {
  id: "22222222-2222-4222-8222-222222222222",
  title: "Test Resource",
  description: "A test resource description",
  fileUrl: "https://example.com/file.pdf",
  fileType: "application/pdf",
  fileSize: 1024,
  upvoteCount: 5,
  downvoteCount: 1,
  downloadCount: 10,
  viewCount: 50,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  course: { id: "33333333-3333-4333-8333-333333333333", code: "CSE101", name: "Intro to Programming" },
  category: { id: "44444444-4444-4444-8444-444444444444", name: "Lecture Notes", slug: "lecture-notes" },
  uploader: { id: "11111111-1111-4111-8111-111111111111", name: "Test User", image: null },
  resourceTags: [
    { tag: { id: "55555555-5555-4555-8555-555555555555", name: "JavaScript", slug: "javascript" } },
  ],
  userVote: null,
  isBookmarked: false,
};

export const mockDiscussion = {
  id: "66666666-6666-4666-8666-666666666666",
  title: "Test Discussion",
  content: "What do you think?",
  visibility: "PUBLIC" as const,
  upvoteCount: 3,
  downvoteCount: 0,
  replyCount: 5,
  viewCount: 20,
  isPinned: false,
  isLocked: false,
  isSolved: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  author: { id: "11111111-1111-4111-8111-111111111111", name: "Test User", image: null },
  course: { id: "33333333-3333-4333-8333-333333333333", code: "CSE101", name: "Intro to Programming" },
  category: { id: "77777777-7777-4777-8777-777777777777", name: "General", slug: "general", color: "#6366f1" },
  discussionTags: [],
  userVote: null,
  isBookmarked: false,
};

export const mockQuestion = {
  id: "88888888-8888-4888-8888-888888888888",
  title: "How to sort an array?",
  content: "I need help sorting.",
  status: "OPEN" as const,
  upvoteCount: 10,
  downvoteCount: 1,
  answerCount: 3,
  viewCount: 100,
  createdAt: "2024-01-01T00:00:00.000Z",
  author: { id: "11111111-1111-4111-8111-111111111111", name: "Test User", image: null },
  course: { id: "33333333-3333-4333-8333-333333333333", code: "CSE101", name: "Intro to Programming" },
  category: { id: "99999999-9999-4999-8999-999999999999", name: "Programming", slug: "programming", color: "#10b981" },
  questionTags: [],
  userVote: null,
  isBookmarked: false,
};

export const mockConversation = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  type: "DIRECT" as const,
  name: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  participants: [
    { userId: "11111111-1111-4111-8111-111111111111", user: { id: "11111111-1111-4111-8111-111111111111", name: "Test User", image: null } },
    { userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", user: { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", name: "Other User", image: null } },
  ],
  lastMessage: { id: "msg1", content: "Hello!", createdAt: "2024-01-01T00:00:00.000Z", senderId: "11111111-1111-4111-8111-111111111111" },
  _count: { messages: 10 },
  unreadCount: 2,
};

export const mockStatsCardProps = {
  label: "Total Users",
  value: 1250,
  icon: "Users",
  trend: 12.5,
};

export const mockChatMessage = {
  id: "msg-001",
  role: "USER" as const,
  content: "Hello AI!",
  createdAt: "2024-01-01T10:00:00.000Z",
  isHelpful: null,
};

export const mockChatMessageAI = {
  id: "msg-002",
  role: "ASSISTANT" as const,
  content: "Hello! How can I help you?",
  createdAt: "2024-01-01T10:00:05.000Z",
  isHelpful: null,
};
