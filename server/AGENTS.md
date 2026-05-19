# Backend AGENTS.md

Module context: Bun-based API proxy server proxying AI provider requests (Anthropic/Google), managing environment secrets, and enforcing request/response contracts.

## Tech Stack & Constraints

- Bun runtime (NOT Node.js)
- Bun.serve for HTTP server (listening on port 3002)
- TypeScript for type safety
- No external HTTP libraries — use Bun's native fetch API
- CORS headers set to `*` (permissive in dev mode only)

## Implementation Patterns

### API Endpoint: POST /api/generate

Request format:
```json
{
  "prompt": "Create a React button",
  "provider": "anthropic",
  "apiKey": "sk-ant-..."
}
```

Response format (success):
```json
{
  "component": "const MyButton = () => { ... };\nrender(<MyButton />);",
  "provider": "anthropic"
}
```

Response format (error):
```json
{
  "error": "API_KEY_INVALID | INVALID_PROMPT | PROVIDER_NOT_SUPPORTED | RATE_LIMIT | INTERNAL_ERROR",
  "details": "Detailed error message"
}
```

Patterns:
- Always include `Content-Type: application/json` in responses
- Validate `provider` field; reject if not 'anthropic' or 'google'
- Validate `prompt` length (min 1, max 2000 characters)
- Pass `apiKey` to corresponding AI provider (resolveApiKey pattern)

### Environment Variables

```bash
# Optional: server-side API keys (fallback if client doesn't provide)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Optional: API Model Overrides
ANTHROPIC_MODEL=claude-opus-4-7  # defaults to latest if not set
GOOGLE_MODEL=gemini-2.0-flash-001 # defaults to latest if not set

# Optional: Debug logging
DEBUG=true
```

### Provider Implementations

- **Anthropic:** Use official @anthropic-ai/sdk (or fetch API)
  - Model default: claude-opus-4-7 (or newest stable)
  - System prompt: "You are an expert React developer..."
  - Temperature: 0.7
  
- **Google Gemini:** Use official @google/generative-ai (or fetch API)
  - Model default: gemini-2.0-flash-001
  - SafetySetting: BLOCK_ONLY_HIGH
  - Temperature: 0.7

### Error Handling

```typescript
try {
  // AI API call
} catch (error) {
  // Distinguish error types:
  if (error.status === 401) return { error: 'API_KEY_INVALID' };
  if (error.status === 429) return { error: 'RATE_LIMIT' };
  return { error: 'INTERNAL_ERROR', details: error.message };
}
```

Return HTTP 200 with error object in body (NOT 5xx status codes). Frontend must parse `response.error`.

## Testing Strategy

Manual testing: Run `bun run server` separately, test via `curl`:

```bash
curl -X POST http://localhost:3002/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","provider":"anthropic","apiKey":"..."}'
```

## Local Golden Rules

Do's:
- Always validate `apiKey` and `provider` before calling AI APIs
- Implement timeout (30s max) for upstream AI provider calls
- Log all API calls (include timestamp, provider, prompt hash) for debugging
- Return consistent JSON error objects with `error` + `details` fields

Don'ts:
- Never log raw API keys (log only key prefix: `sk-ant-XXXXX...`)
- Never expose internal error messages from AI SDKs directly (sanitize)
- Never keep server process running without error handling (use try/catch)
- Never allow client-side CORS requests without explicit CORS headers
