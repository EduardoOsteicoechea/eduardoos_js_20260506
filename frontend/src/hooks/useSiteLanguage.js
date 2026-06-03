import { useSyncExternalStore } from 'react';
import {
  getSiteLanguage,
  SITE_LANGUAGE_CHANGE_EVENT,
} from '../lib/siteLanguage';
import { CHAT_LANGUAGE_STORAGE_KEY } from '../lib/chatbot/chatLanguage';

let revision = 0;

function subscribe(listener) {
  const onChange = () => {
    revision += 1;
    listener();
  };

  window.addEventListener(SITE_LANGUAGE_CHANGE_EVENT, onChange);
  window.addEventListener('storage', (event) => {
    if (event.key === CHAT_LANGUAGE_STORAGE_KEY) onChange();
  });

  return () => {
    window.removeEventListener(SITE_LANGUAGE_CHANGE_EVENT, onChange);
  };
}

function getSnapshot() {
  return `${revision}:${getSiteLanguage()}`;
}

export function useSiteLanguage() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => '0:en');
  return /** @type {import('../lib/siteLanguage').SiteLanguageId} */ (
    snapshot.split(':')[1] ?? 'en'
  );
}
