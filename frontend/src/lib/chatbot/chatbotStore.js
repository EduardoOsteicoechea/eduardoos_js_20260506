import { isChatbotOpenByDefault } from '../../config/chatbotTrayRoutes';
import {
  cycleChatLanguage,
  getStoredChatLanguage,
  setStoredChatLanguage,
} from './chatLanguage';
import { notifySiteLanguageChange } from '../siteLanguage';
import { extractPageContext } from './extractPageContext';
import { getGlobalChatContext } from './globalContext';

/** @type {Set<() => void>} */
const listeners = new Set();

let revision = 0;
let trayOpen = false;
let pathname = '/';

/** @type {import('./chatLanguage').ChatLanguageId} */
let preferredLanguage = getStoredChatLanguage();

/** @type {import('./pageContextSchema').PageContextPayload | null} */
let pageContext = null;

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function getChatbotRevision() {
  return revision;
}

function syncDom() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('chatbot-tray-open', trayOpen);
}

function refreshPageContext() {
  pageContext = extractPageContext(pathname);
}

/**
 * @param {string} nextPathname
 */
export function initChatbotStore(nextPathname) {
  pathname = nextPathname;
  trayOpen = isChatbotOpenByDefault(pathname);
  refreshPageContext();
  syncDom();
  emit();
}

/**
 * @param {string} nextPathname
 */
export function setChatbotPathname(nextPathname) {
  pathname = nextPathname;
  trayOpen = isChatbotOpenByDefault(pathname);
  refreshPageContext();
  syncDom();
  emit();
}

export function subscribeChatbot(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getChatbotTrayOpen() {
  return trayOpen;
}

export function getChatbotPathname() {
  return pathname;
}

export function getChatbotPageContext() {
  if (!pageContext) {
    pageContext = extractPageContext(pathname);
  }
  return pageContext;
}

export function getChatbotPreferredLanguage() {
  return preferredLanguage;
}

export function getChatbotGlobalContext() {
  return getGlobalChatContext(pathname, preferredLanguage);
}

/** @param {import('./chatLanguage').ChatLanguageId} languageId */
export function setChatbotLanguage(languageId) {
  if (languageId === preferredLanguage) return;
  preferredLanguage = languageId;
  setStoredChatLanguage(languageId);
  notifySiteLanguageChange();
  emit();
}

export function cycleChatbotLanguage() {
  setChatbotLanguage(cycleChatLanguage(preferredLanguage));
}

export function openChatbotTray() {
  if (trayOpen) return;
  trayOpen = true;
  syncDom();
  emit();
  refreshPageContext();
}

export function closeChatbotTray() {
  if (!trayOpen) return;
  trayOpen = false;
  syncDom();
  emit();
}

export function toggleChatbotTray() {
  trayOpen = !trayOpen;
  syncDom();
  emit();
  if (trayOpen) refreshPageContext();
}

export function refreshChatbotPageContext() {
  refreshPageContext();
  emit();
}
