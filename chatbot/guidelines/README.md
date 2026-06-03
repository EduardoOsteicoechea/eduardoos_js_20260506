# Chatbot guidelines & context

## Files

| Path | Purpose |
|------|---------|
| `RESPONSE_GUIDELINES.md` | Persona, tone, privacy, address rule (always in system prompt) |
| `knowledge/*.md` | Biography RAG (`eduardo-identity.md`, `eduardo-work-experience.md`, etc.) |

Environment (in `chatbot/.env`):

```env
GUIDELINES_PATH=/home/ec2-user/chatbot/guidelines/RESPONSE_GUIDELINES.md
KNOWLEDGE_DIR=/home/ec2-user/chatbot/guidelines/knowledge
KNOWLEDGE_MAX_CHARS=28000
```

Restart after edits: `sudo systemctl restart eduardoos-chatbot`

## Recommended context pattern (for this site)

You already send two dynamic layers from the frontend:

1. **Page context** — what the user is viewing now (heading, excerpt, skills on home, article sections).
2. **Global context** — future session permissions / user profile (not implemented yet).

Add a third layer on the server (this folder):

3. **Static knowledge** — markdown files here, always (or selectively) injected.

That is the best fit **before** a full vector database:

```
┌─────────────────────────────────────────────────────────┐
│  System prompt                                          │
│  ├── RESPONSE_GUIDELINES.md  (behavior)                 │
│  ├── knowledge/*.md          (stable facts)             │
│  ├── pageContext JSON        (current page, per request)│
│  └── globalContext JSON      (session, when ready)      │
└─────────────────────────────────────────────────────────┘
```

### When to use what

| Need | Pattern |
|------|---------|
| Tone, language, guardrails | `RESPONSE_GUIDELINES.md` |
| Bio, services, FAQs, policies | `knowledge/*.md` |
| “What is on this page?” | **Page context** (DOM extract) |
| User-specific data | **Global context** (session API later) |
| Large doc corpus / PDFs | **Vector RAG** (phase 2 — see below) |

### Phase 2 — Vector RAG (only if static files are not enough)

Use when you have many long documents (manuals, article archive, PDFs):

1. Chunk documents offline.
2. Embed with an embedding API.
3. Store in a vector DB (pgvector, Qdrant, etc.).
4. On each chat message: embed the user question → retrieve top-k chunks → inject into prompt.

Keep retrieval **server-side** (chatbot or backend), not in the browser, so API keys stay private.

### Anti-patterns

- Putting the whole site HTML in every request (noisy, expensive).
- Letting the model browse the web (not supported).
- Storing secrets in `knowledge/` (files may be logged in telemetry).
