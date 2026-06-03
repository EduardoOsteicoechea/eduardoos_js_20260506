import { WHATSAPP_URL } from '../../lib/contactLinks';
import { openChatbotWithHomeIntro } from '../../lib/chatbot/chatbotStore';
import { useSiteLanguage } from '../../hooks/useSiteLanguage';
import { getSiteLabel } from '../../lib/siteLanguage';

const ctaBase =
  'inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-lg border px-3 py-3 text-xs font-bold uppercase tracking-wide transition sm:px-4 sm:text-sm lg:px-6';

const letsTalkClass = `${ctaBase} border-green-600/70 bg-green-500/20 text-green-900 hover:bg-green-500/30 dark:border-green-400/60 dark:bg-green-500/25 dark:text-green-200 dark:hover:bg-green-500/35`;

const askAnythingClass = `${ctaBase} border-blue-600/70 bg-blue-500/20 text-blue-900 hover:bg-blue-500/30 dark:border-blue-400/60 dark:bg-blue-500/25 dark:text-blue-100 dark:hover:bg-blue-500/35`;

export default function HomeCtaButtons() {
  const lang = useSiteLanguage();

  return (
    <div className="mt-6 flex w-full flex-row items-stretch gap-2 sm:gap-3">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={letsTalkClass}
      >
        {getSiteLabel('letsTalk', lang)}
      </a>

      <button
        type="button"
        onClick={() => openChatbotWithHomeIntro(lang)}
        className={askAnythingClass}
      >
        {getSiteLabel('askAnything', lang)}
      </button>
    </div>
  );
}
