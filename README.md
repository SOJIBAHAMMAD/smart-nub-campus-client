# Smart NUB Campus Client

Frontend for Smart NUB Campus — an academic collaboration network for Northern University Bangladesh.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Components:** shadcn-style primitives built on Base UI + Radix
- **Forms:** react-hook-form v7 + Zod v4 validation
- **Animations:** Framer Motion (motion v12)
- **Real-time:** Socket.IO client
- **Charts:** Recharts
- **Testing:** Vitest + Testing Library + Playwright (E2E)

## Project Structure

```
src/
├── app/                                # Next.js App Router
│   ├── layout.tsx                      # Root layout (fonts, ThemeProvider, Toaster)
│   ├── globals.css                     # Tailwind v4 + design system
│   ├── error.tsx                       # Global error boundary
│   ├── not-found.tsx                   # Custom 404
│   ├── (auth)/                         # Unauthenticated pages
│   │   ├── layout.tsx                  # Auth shell (header, footer, theme toggle)
│   │   └── auth/
│   │       ├── page.tsx                # Landing (New Student vs Verified Student)
│   │       ├── login/page.tsx          # Login (student ID or email + password)
│   │       ├── forgot-password/page.tsx
│   │       ├── reset-password/page.tsx
│   │       ├── verify-email/page.tsx
│   │       └── onboarding/             # Multi-step onboarding flow
│   ├── (app)/                          # Authenticated pages
│   │   ├── layout.tsx                  # App shell (TopNav, fetches /identity/me)
│   │   ├── page.tsx                    # Home dashboard
│   │   ├── resources/                  # Academic resource library
│   │   ├── teams/                      # Team formation (LFG)
│   │   ├── discussions/                # Discussion forum
│   │   ├── qa/                         # Q&A forum
│   │   ├── ai/                         # AI chat assistant
│   │   ├── connections/                # Social networking
│   │   ├── messages/                   # Direct & group messaging
│   │   ├── notifications/              # In-app notifications
│   │   ├── profile/[id]/              # Public user profile
│   │   └── settings/[[...section]]/   # Settings (catch-all routing)
│   └── admin/                          # Admin dashboard
│       ├── layout.tsx                  # Admin shell (sidebar + header)
│       ├── page.tsx                    # Dashboard (stats, charts, activity)
│       ├── users/                      # User management
│       ├── verifications/              # Verification review
│       ├── courses/                    # Courses & categories
│       ├── events/                     # Events management
│       └── resources/                  # Resource management
├── actions/                            # 16 server action files
├── components/
│   ├── ui/                             # 30 primitives + 28 custom icons
│   ├── admin/                          # 9 admin components
│   ├── ai/                             # 10 AI chat components
│   ├── connections/                    # 10 connection components
│   ├── discussions/                    # 9 discussion components
│   ├── events/                         # Event list client
│   ├── forms/                          # 8 form components + fields/
│   ├── home/                           # 5 home page components
│   ├── layout/                         # 3 layout components
│   ├── messages/                       # 17 messaging components
│   ├── notifications/                  # 2 notification components
│   ├── profile/                        # Profile client
│   ├── qa/                             # 10 Q&A components
│   ├── resources/                      # 9 resource components
│   ├── settings/                       # 11 settings components
│   ├── skeletons/                      # 14 skeleton loading components
│   ├── teams/                          # 8 team components
│   └── theme/                          # Dark/light mode toggle
├── constants/                          # Routes, enums, departments, cache tags
├── hooks/                              # 14 custom hooks
├── lib/
│   ├── api-client.ts                   # Client-side API (browser)
│   ├── server-api.ts                   # Server-side API (Next.js + cache invalidation)
│   ├── auth-client.ts                  # Better Auth React client
│   ├── utils.ts                        # cn(), buildQueryString()
│   └── types/socket-events.ts          # Socket.IO event types
├── providers/                          # ThemeProvider
├── schemas/                            # 14 Zod validation schemas
├── services/                           # 21 API service files
├── types/                              # 20 TypeScript type definition files
├── env.ts                              # @t3-oss/env-nextjs validated env
└── proxy.ts                            # Auth + role-based routing middleware
```

## Pages

### Auth Pages

| URL | Description |
|-----|-------------|
| `/auth` | Landing — "I'm a New Student" vs "I'm a Verified Student" |
| `/auth/login` | Login with student ID or email + password |
| `/auth/forgot-password` | Enter identifier, receive OTP |
| `/auth/reset-password` | Enter OTP + new password |
| `/auth/verify-email` | Standalone email OTP verification |
| `/auth/onboarding` | Multi-step: verify identity → admin review → create account → verify email → done |

### App Pages (Authenticated)

| URL | Description |
|-----|-------------|
| `/` | Home dashboard (hero banner, quick access, trending resources, upcoming events, top contributors) |
| `/resources` | Academic resource library with search, filters, categories, courses, tags |
| `/resources/upload` | Upload new resource |
| `/resources/[id]` | Resource detail (download, comments, voting) |
| `/teams` | Team formation (LFG) with applications |
| `/teams/create` | Create team request |
| `/teams/[id]` | Team detail (apply, manage members) |
| `/discussions` | Discussion forum with search, categories, tags, trending |
| `/discussions/create` | Create new discussion |
| `/discussions/[id]` | Discussion detail (replies, voting, pin/lock/solved) |
| `/qa` | Q&A forum with search, categories, tags, trending |
| `/qa/ask` | Ask a question |
| `/qa/[id]` | Question detail (answers, voting, accept answer) |
| `/ai` | AI chat assistant with sessions, study stats, tools |
| `/connections` | People search, suggestions, skills, connection management |
| `/messages` | Direct & group messaging (4-column layout, real-time) |
| `/notifications` | Notification list with mark as read |
| `/profile/[id]` | Public user profile |
| `/settings/[...]` | Settings: profile, notifications, privacy, security, account, blocked |

### Admin Pages

| URL | Description |
|-----|-------------|
| `/admin` | Dashboard with stats cards, charts, recent activity |
| `/admin/users` | User management (search, filter, suspend/ban/activate) |
| `/admin/verifications` | Verification request review (approve/reject) |
| `/admin/courses` | Courses & categories CRUD (4 tabs) |
| `/admin/events` | Events CRUD |
| `/admin/resources` | Resource management (verify/unverify/delete) |

## Architecture

### Dual API Client

The app uses two API clients for different contexts:

1. **`serverApi`** (`src/lib/server-api.ts`) — For server components and server actions. Forwards cookies from Next.js, supports cache tags for automatic invalidation after mutations.

2. **`apiClient`** (`src/lib/api-client.ts`) — For client components. Runs in the browser using `fetch` directly with `credentials: "include"`.

Services are split accordingly (e.g., `ai.service.ts` for server, `ai.client.service.ts` for client).

### Server Components + Client Hydration

Most list pages are **Server Components** that pre-fetch data and pass it as props to interactive **Client Components**. Detail pages (discussions, questions, resources) are typically Client Components that fetch via server actions in `useEffect`.

### Real-time via Socket.IO

`useSocket` + `useSocketEvent` hooks manage a persistent WebSocket connection with heartbeat, auto-reconnect, and typed events for messaging, notifications, typing indicators, and presence.

### Cache Invalidation

Services pass `invalidatesTags` to `serverApi` mutations, which triggers automatic revalidation after successful writes.

## Custom Hooks

| Hook | Description |
|------|-------------|
| `useDebounce` | Debounce values (search inputs) |
| `usePagination` | Pagination state with optional URL sync |
| `useInfiniteScroll` | IntersectionObserver-based infinite scroll |
| `useSocket` | Socket.IO connection with heartbeat and auto-reconnect |
| `useSocketEvent` | Subscribe to typed Socket.IO events |
| `useNotifications` | Notification list state management |
| `useUnreadCount` | Global unread count with real-time updates |
| `useUpload` | File upload hook |
| `useEmailVerification` | Full OTP verification flow with countdown |
| `useMediaQuery` | CSS media query matching |
| `useAsRef` | Ref that always holds latest value |
| `useIsomorphicLayoutEffect` | SSR-safe useLayoutEffect |
| `useLazyRef` | Lazy-initialized ref |

## Component Library

UI primitives are built as shadcn-style components:
- Built on [Base UI](https://baseui.com) + [@radix-ui/react-slot](https://radix-ui.com)
- Styled with [CVA](https://cva.style) for variant management
- Tailwind CSS v4 for styling
- 28 custom icon components wrapping lucide-react
- 14 skeleton loading states for all major views

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

## Environment Variables

All variables below are validated at runtime via `@t3-oss/env-nextjs` (`src/env.ts`). Copy `.env.example` to `.env.local` and fill every value — the app will fail fast at startup if a required variable is missing.

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `BACKEND_URL` | Yes | Server-only | Backend base URL (e.g., `http://localhost:5000`) |
| `FRONTEND_URL` | Yes | Server-only | Frontend URL (e.g., `http://localhost:3000`) |
| `API_URL` | Yes | Server-only | Full API endpoint URL (e.g., `http://localhost:5000/api/v1`) |
| `AUTH_URL` | Yes | Server-only | Better Auth endpoint URL (e.g., `http://localhost:5000/api/v1/auth`) |
| `NODE_ENV` | Yes | Server-only | `development` or `production` |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Public | Backend base URL for the browser (Better Auth client, Socket.IO) |
| `NEXT_PUBLIC_FRONTEND_URL` | Yes | Public | Frontend URL for the browser |
| `NEXT_PUBLIC_API_URL` | Yes | Public | Backend API URL for the browser (e.g., `http://localhost:5000/api/v1`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Public | Cloudinary cloud name |

> **Security note:** Never prefix secrets with `NEXT_PUBLIC_` — anything prefixed that way is bundled into the browser. Keep API keys and auth secrets server-only.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Deployment

Production checklist and best-practice gaps are tracked in [`Review/05-DEPLOYMENT-READINESS.md`](../Review/05-DEPLOYMENT-READINESS.md) at the repository root.

```bash
# Build for production
npm run build

# Start production server
npm start
```

> **Note:** the final pre-deployment security review (2026-08-10) found Critical/High issues that must be resolved before going live. See [`Review/00-EXECUTIVE-SUMMARY.md`](../Review/00-EXECUTIVE-SUMMARY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Important:** The `development` branch always contains the latest code. Always create your feature/fix branches off from `development`.
