import {
  CHATBOT_TRAY_DEFAULT_WIDTH_PX,
  CHATBOT_TRAY_MAX_VW,
  CHATBOT_TRAY_MIN_WIDTH_PX,
} from '../config/chatbotTrayRoutes';

const STORAGE_KEY = 'eduardoos-chatbot-tray-width';

/** @type {Set<() => void>} */
const listeners = new Set();

let revision = 0;
let widthPx = CHATBOT_TRAY_DEFAULT_WIDTH_PX;

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function getChatbotTrayWidthRevision() {
  return revision;
}

export function subscribeChatbotTrayWidth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function clampTrayWidth(px) {
  const maxPx = Math.round((window.innerWidth * CHATBOT_TRAY_MAX_VW) / 100);
  return Math.min(maxPx, Math.max(CHATBOT_TRAY_MIN_WIDTH_PX, Math.round(px)));
}

function readStoredWidth() {
  if (typeof localStorage === 'undefined') return CHATBOT_TRAY_DEFAULT_WIDTH_PX;
  const raw = Number(localStorage.getItem(STORAGE_KEY));
  if (!Number.isFinite(raw) || raw <= 0) return CHATBOT_TRAY_DEFAULT_WIDTH_PX;
  if (typeof window === 'undefined') return raw;
  return clampTrayWidth(raw);
}

function applyTrayWidthToDom(px) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--chatbot-tray-width', `${px}px`);
}

export function getChatbotTrayWidthPx() {
  return widthPx;
}

export function setChatbotTrayWidthPx(px, { persist = true } = {}) {
  if (typeof window === 'undefined') return;
  widthPx = clampTrayWidth(px);
  applyTrayWidthToDom(widthPx);
  if (persist) {
    localStorage.setItem(STORAGE_KEY, String(widthPx));
  }
  emit();
}

export function initChatbotTrayWidth() {
  widthPx = readStoredWidth();
  applyTrayWidthToDom(widthPx);
}

if (typeof window !== 'undefined') {
  initChatbotTrayWidth();
  window.addEventListener('resize', () => {
    const clamped = clampTrayWidth(widthPx);
    if (clamped !== widthPx) {
      setChatbotTrayWidthPx(clamped);
    } else {
      applyTrayWidthToDom(widthPx);
    }
  });
}
