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
 * Fixed overlay shell: chat tray stacks above the activity bar so inputs are never hidden.
 *
 * @param {{
 *   pathname: string,
 *   activityBarMode?: import('../../config/activityBarConfig').ActivityBarPageMode,
 *   showActivityBar?: boolean,
 *   reserveBottomBar?: boolean,
 * }} props
 */
export default function SiteChromeShell({
  pathname,
  activityBarMode = 'default',
  showActivityBar = true,
  reserveBottomBar = false,
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
    <div
      className={`site-chrome${!showActivityBar && reserveBottomBar ? ' site-chrome--reserve-bar' : ''}`}
      data-site-chrome
    >
      <div className="site-chrome__chat-region">
        <ChatbotTray inline />
      </div>
      {showActivityBar ? (
        <div className="site-chrome__bar">
          <ActivityBar pathname={pathname} pageMode={activityBarMode} />
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
