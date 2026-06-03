# Chatbot API (Go)

Internal LLM proxy. **Not exposed publicly** — only the Node backend calls it on `127.0.0.1:8110`.

## LLM: DeepSeek

Uses the [DeepSeek API](https://api.deepseek.com) (OpenAI-compatible).

| Variable | Default |
|----------|---------|
| `LLM_API_URL` | `https://api.deepseek.com/chat/completions` |
| `LLM_MODEL` | `deepseek-chat` (use `deepseek-reasoner` for thinking mode) |
| `LLM_API_KEY` | from [DeepSeek platform](https://platform.deepseek.com/api_keys) |

## Local dev

```bash
cp .env.example .env
# Set LLM_API_KEY and match CHATBOT_INTERNAL_TOKEN with backend/.env
go run ./cmd/server
curl http://127.0.0.1:8110/health
```

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | none |
| POST | `/chat` | `X-Chatbot-Internal-Token` |

## Frontend path

Browser → `POST /api/chatbot` → backend → `POST http://127.0.0.1:8110/chat`
