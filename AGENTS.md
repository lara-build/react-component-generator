# AGENTS.md

Central governance rules for AI agents operating in this React Component Generator project.

## Operational Commands

These commands are the only supported workflows:

```bash
# Install & Setup
bun install

# Development (API + Frontend)
bun run dev              # Concurrent: Bun server (3002) + Vite dev server (5173)
bun run server          # Bun server only (with watch mode)

# Build & Deploy
bun run build           # TypeScript compile + Vite build

# Code Quality
bun run lint            # ESLint check entire project
bun run preview         # Preview built output locally
```

Do NOT use npm, yarn, or pnpm. Bun is the ONLY package manager and runtime for this project.

## Golden Rules

### Security (Immutable)

1. Never hardcode API keys in source code. Use environment variables only.
2. All API key injection must be explicit: server-side (from .env) OR client-side (from user input).
3. When adding AI providers, always implement `resolveApiKey()` pattern to support both sources.
4. CORS headers are deliberately permissive in dev mode (`*`). Do NOT use in production without restriction.

### Component Generation (Do's & Don'ts)

Do's:
- Always generate self-contained React components with inline styles only.
- Use react-live compatible code (plain JavaScript, no TypeScript syntax in generated code).
- Ensure `render()` call is present at the end of generated code.
- Support both Anthropic and Google APIs via the `Provider` type.

Don'ts:
- Do NOT add CSS imports or CSS modules to generated components.
- Do NOT use TypeScript syntax (interfaces, type annotations) in SYSTEM_PROMPT output.
- Do NOT import React; it's globally available in react-live scope.
- Do NOT generate synchronous fetch or async operations that block rendering.

### Error Handling

- API errors must be caught, logged, and presented to the user via UI error banner.
- Component rendering failures in react-live must be displayed inline (not thrown).
- Missing API keys must trigger a clear, actionable error message per provider.

### Code Patterns

- Use React hooks (useState, useCallback, useEffect) for state management — no external state library.
- All async operations in server must resolve to simple JSON responses.
- Generated component IDs must include timestamp + random slug: `${Date.now()}-${random()}`.

## Project Context

React Component Generator: AI-powered React component playground. Users input natural language prompts, AI generates styled components, instant live preview via react-live.

Tech Stack: React 19, TypeScript, Vite, Bun, Anthropic Claude, Google Gemini.

## Standards & References

### Git Workflow

Use Conventional Commits format (see smart-commit skill):
- `feat(scope): description`
- `fix(scope): description`
- `refactor: description`
- `chore: description`
- `docs: description`

Example: `feat(generator): add claude-opus support`

### Maintenance Policy

If rules in AGENTS.md diverge from actual code behavior, immediately propose updates. This file is a living contract and must stay synchronized with implementation.

When extending AI providers or changing the generation strategy, ensure this file is updated before shipping.

## Context Map

No nested AGENTS.md files required. All rules apply globally.
