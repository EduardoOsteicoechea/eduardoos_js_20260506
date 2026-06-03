import { WHATSAPP_URL } from '../../lib/contactLinks';
import { openChatbotWithHomeIntro } from '../../lib/chatbot/chatbotStore';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

const ctaClass =
  'theme-border inline-flex min-h-11 min-w-[9rem] flex-1 items-center justify-center rounded-lg border px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-black/5 dark:hover:bg-white/10 sm:flex-none';

export default function HomeCtaButtons() {
  const lang = useSiteLanguage();

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={ctaClass}
      >
        {getSiteLabel('letsTalk', lang)}
      </a>

      <button
        type="button"
        onClick={() => openChatbotWithHomeIntro(lang)}
        className={ctaClass}
      >
        {getSiteLabel('askAnything', lang)}
      </button>
    </div>
  );
}
