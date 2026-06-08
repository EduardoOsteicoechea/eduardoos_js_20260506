import { WHATSAPP_URL } from '../../lib/contactLinks';
import { openChatbotWithHomeIntro } from '../../lib/chatbot/chatbotStore';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

export default function HomeCtaButtons() {
  const lang = useSiteLanguage();

  return (
    <div className="home_cta_buttons_outer_container">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="action_button level_1_action"
      >
        {getSiteLabel('letsTalk', lang)}
      </a>

      <button
        type="button"
        onClick={() => openChatbotWithHomeIntro(lang)}
        className="action_button level_2_action"
      >
        {getSiteLabel('askAnything', lang)}
      </button>
    </div>
  );
}
