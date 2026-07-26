# Contributing to Smart NUB Campus Client

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Branching Strategy

> **The `development` branch always contains the latest code.**

| Branch | Purpose |
|--------|---------|
| `development` | Active development, all PRs target this branch |
| `main` | Stable releases only, merged from `development` |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Maintenance, refactoring, config changes |

### Creating a branch

Always branch off from `development`:

```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

Name your branch descriptively:
- `feature/chat-system`
- `fix/onboarding-validation`
- `chore/update-dependencies`

## Getting Started

1. **Fork** the repository (if you don't have write access)
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/smart-nub-campus-client.git
   cd smart-nub-campus-client
   ```
3. **Set up** the project:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL (e.g., http://localhost:5000/api/v1)
   npm install
   npm run dev
   ```
4. Create your branch from `development`

## Development Workflow

1. Make your changes in your feature branch
2. Run linter before committing:
   ```bash
   npm run lint
   ```
3. Run tests to make sure nothing is broken:
   ```bash
   npm run test
   ```
4. Commit your changes with a clear message
5. Push your branch and open a PR against `development`

## Commit Messages

Use clear, concise commit messages:

```
feat: add real-time chat with Socket.IO
fix: resolve onboarding step skip on refresh
chore: update dependencies
docs: update API client documentation
```

Prefix with: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`.

## Pull Requests

- Target the `development` branch (never `main` directly)
- Keep PRs focused — one feature or fix per PR
- Describe what changed and why
- Reference any related issues
- Make sure lint and tests pass before requesting review

## Code Style

- Use TypeScript for all new code
- Follow the existing patterns in the codebase (check neighboring files)
- Use `camelCase` for variables and functions, `PascalCase` for React components and types
- Keep components small and focused
- Add proper TypeScript types — avoid `any`
- Use `clsx` + `tailwind-merge` for conditional class names (via the `cn` utility)

## Project Structure

```
src/
├── app/                            # Next.js App Router pages
│   ├── (auth)/                     # Auth pages (login, signup, onboarding)
│   └── (root)/                     # Root layout pages
├── actions/                        # Server actions (API call proxies)
├── components/
│   ├── forms/                      # Reusable form components
│   ├── home/                       # Home page components
│   ├── theme/                      # Theme provider
│   └── ui/                         # UI primitives (Base UI + CVA)
├── constants/                      # App constants
├── hooks/                          # Custom React hooks
├── lib/
│   ├── api-client.ts               # Client-side API (browser)
│   └── server-api.ts               # Server-side API (Next.js server)
├── providers/                      # Context providers
├── schemas/                        # Zod validation schemas
├── services/                       # API service functions
└── types/                          # TypeScript type definitions
```

## Need Help?

- Check the [client docs](docs/) for API client and server API details
- Open an issue to discuss large changes before starting work
