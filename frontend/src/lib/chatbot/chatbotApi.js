/**
 * @param {{
 *   message: string,
 *   pageContext: unknown,
 *   globalContext: unknown,
 *   history?: { role: string, content: string }[],
 * }} params
 * @returns {Promise<string>}
 */
export async function sendChatbotMessage({
  message,
  pageContext,
  globalContext,
  history = [],
}) {
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      message,
      pageContext,
      globalContext,
      history,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err =
      typeof data?.error === 'string'
        ? data.error
        : `Chat API error (${response.status})`;
    throw new Error(err);
  }

  if (typeof data?.reply === 'string') return data.reply;
  if (typeof data?.message === 'string') return data.message;

  throw new Error('Chat API returned an unexpected response shape');
}
