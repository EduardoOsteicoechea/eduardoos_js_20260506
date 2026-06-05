import { WHATSAPP_URL } from '../../lib/contactLinks';
import { openChatbotWithHomeIntro } from '../../lib/chatbot/chatbotStore';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

export default function HomeCtaButtons() {
  const lang = useSiteLanguage();

  return (
    <div className="home-cta">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="home-cta__btn home-cta__btn--talk"
      >
        {getSiteLabel('letsTalk', lang)}
      </a>

      <button
        type="button"
        onClick={() => openChatbotWithHomeIntro(lang)}
        className="home-cta__btn home-cta__btn--ask"
      >
        {getSiteLabel('askAnything', lang)}
      </button>
    </div>
  );
}
