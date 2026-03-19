

# AI Chat Widget - "Beena" Inspector Assistant

## Overview
Build a floating AI chatbot powered by OpenAI GPT-4o-mini, accessible to logged-in users on all authenticated pages. No database tables needed.

## Components

### 1. Edge Function: `supabase/functions/chat/index.ts`
- CORS headers, OPTIONS handler
- `verify_jwt = false` in config.toml, authenticate via `getClaims()` in code
- Reads `OPENAI_API_KEY` from env
- Calls OpenAI `https://api.openai.com/v1/chat/completions` with model `gpt-4o-mini`
- System prompt about Beena the AI Inspector Assistant
- Returns JSON response (non-streaming for simplicity with `supabase.functions.invoke`)

### 2. Secret: `OPENAI_API_KEY`
- Store the provided key as a Supabase secret using the secrets tool

### 3. Chat Widget: `src/components/AIChat/AIChat.tsx`
- Floating blue button bottom-right with "Ask Beena" label
- Expands to 400x600px chat panel
- Blue header with title and subtitle
- Message list with user (blue, right) and assistant (gray, left) bubbles
- Renders markdown-like formatting (bold, bullets) via simple parsing or `react-markdown`
- Textarea + send button, Enter to send, Shift+Enter for newline
- Loading indicator while awaiting response
- Initial greeting message from Beena
- Footer disclaimer
- Calls `supabase.functions.invoke("chat", { body: { messages } })`

### 4. Integration: `src/components/Layout/AuthenticatedLayout.tsx`
- Add `<AIChat />` inside the authenticated layout, only when `isAuthenticated` is true
- Renders after the `<Outlet />` so it floats above all pages

## Technical Details

**Edge Function config** (`supabase/config.toml`):
```toml
[functions.chat]
verify_jwt = false
```

**Edge Function** authenticates via `getClaims()`, calls OpenAI API directly (not Lovable AI gateway since user provided their own OpenAI key), returns `{ reply: string }`.

**Frontend** uses `supabase.functions.invoke("chat")` which automatically includes the auth token. Messages array sent as conversation history for context.

**Dependencies**: `react-markdown` for rendering assistant responses with formatting.

## File Changes
1. `supabase/functions/chat/index.ts` - New edge function
2. `supabase/config.toml` - Add chat function config
3. `src/components/AIChat/AIChat.tsx` - New chat widget component
4. `src/components/Layout/AuthenticatedLayout.tsx` - Add AIChat to layout

