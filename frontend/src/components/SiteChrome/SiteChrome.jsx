import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ChatbotTray from '../Chatbot/ChatbotTray';
import { ActivityBar } from '../ActivityBar';
import { useVisualViewportChrome } from '../../hooks/useVisualViewportChrome';
import {
  initChatbotStore,
  setChatbotPathname,
} from '../../lib/chatbot/chatbotStore';

/**
 * Single fixed site chrome: AI chat tray + activity bar, identical on every page.
 *
 * @param {{
 *   pathname: string,
 *   activityBarMode?: import('../../config/activityBarConfig').ActivityBarPageMode,
 * }} props
 */
export default function SiteChrome({
  pathname,
  activityBarMode = 'default',
}) {
  const [mounted, setMounted] = useState(false);

  useVisualViewportChrome();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    initChatbotStore(pathname);
  }, []);

  useEffect(() => {
    setChatbotPathname(pathname);
  }, [pathname]);

  if (!mounted) return null;

  return createPortal(
    <div className="site-chrome" data-site-chrome>
      <div className="site-chrome__chat-region">
        <ChatbotTray />
      </div>
      <div className="site-chrome__bar">
        <ActivityBar pathname={pathname} pageMode={activityBarMode} />
      </div>
    </div>,
    document.body,
  );
}
