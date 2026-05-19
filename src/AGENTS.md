# Frontend AGENTS.md

Module context: React UI layer handling user prompts, component preview, and API key management. Depends on Backend API proxies.

## Tech Stack & Constraints

- React 19, TypeScript, Vite build tool
- react-live for sandboxed component rendering (plain JavaScript, NO TypeScript syntax)
- Inline styles only — NO CSS imports, CSS modules, or external stylesheets in generated code
- react-live scope: React, useState, useCallback, useEffect are globally available

## Implementation Patterns

### Component Generation Output

Generated code must:

```javascript
// Minimal example
const MyComponent = () => {
  const [state, setState] = useState('');
  return <div style={{padding: '20px'}}>Content</div>;
};

render(<MyComponent />);
```

Patterns to follow:
- Self-contained: no external imports except React hooks
- Styled inline: `style={{}}` properties, no className references
- Ending with `render(<ComponentName />)` — required for react-live
- Dynamic IDs: `const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9)`

### API Key Handling in Frontend

- Read from `.env` (via Vite `import.meta.env.*`) for server-injected keys
- Accept user input in UI for direct API key injection (when .env is absent)
- Call `/api/generate` endpoint (backend proxy) — never call AI APIs directly from browser
- Always include `provider` (anthropic|google) in request body

### Error Handling Patterns

- Wrap async calls in try/catch; log errors to console and UI error banner
- Display user-facing message: "Failed to generate component: [specific reason]"
- For missing API keys: "API key not configured. Provide in .env or input field above."

### File Naming

- Component files: `ComponentName.tsx` (PascalCase)
- Hook files: `useCustomHook.ts` (camelCase with 'use' prefix)
- Type files: `index.ts` in types/ folder

## Testing Strategy

No unit tests required for generated components (react-live renders are functional tests). For frontend infrastructure:

```bash
bun run lint  # ESLint check
```

Manual testing: Start `bun run dev`, visit http://localhost:5173, test prompt → render flow.

## Local Golden Rules

Do's:
- Always pass `provider` prop explicitly when calling `/api/generate`
- Use useState + useCallback for form state in PromptInput
- Display API key source in UI (from .env vs user input) for debugging

Don'ts:
- Never hardcode API keys in component code (even in generated examples)
- Never use `async`/`await` directly in JSX render methods
- Never import CSS files in generated code (react-live will fail)
- Never rely on external libraries beyond React in generated components
