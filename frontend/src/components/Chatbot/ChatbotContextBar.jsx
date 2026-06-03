import { useEffect } from 'react';
import { useChatbot } from './useChatbot';

/** Logs chat context to the console; not shown in the UI. */
export default function ChatbotContextBar() {
  const { pageContext, globalContext } = useChatbot();

  useEffect(() => {
    console.log('[chatbot] pageContext', pageContext);
    console.log('[chatbot] globalContext', globalContext);
  }, [pageContext, globalContext]);

  return null;
}
