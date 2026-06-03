/**
 * @param {{
 *   message: string,
 *   pageContext: unknown,
 *   globalContext: unknown,
 *   history?: { role: string, content: string }[],
 * }} params
 * @typedef {{ type: 'navigate', path: string, label?: string }} ChatbotAction
 *
 * @returns {Promise<{ reply: string, actions: ChatbotAction[] }>}
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

  const reply =
    typeof data?.reply === 'string'
      ? data.reply
      : typeof data?.message === 'string'
        ? data.message
        : null;

  if (reply === null) {
    throw new Error('Chat API returned an unexpected response shape');
  }

  const actions = Array.isArray(data?.actions)
    ? data.actions.filter(
        (a) =>
          a &&
          a.type === 'navigate' &&
          typeof a.path === 'string' &&
          a.path.startsWith('/'),
      )
    : [];

  return { reply, actions };
}
