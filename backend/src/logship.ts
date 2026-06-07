import {
  POSTS_DB_INTERNAL_TOKEN,
  POSTS_DB_URL,
} from './constants/index.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface AppendLogInput {
  service: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

const INTERNAL_HEADER = 'X-Posts-Db-Internal-Token';
const queue: AppendLogInput[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function postsDbBase(): string | null {
  const base = POSTS_DB_URL.trim().replace(/\/+$/g, '');
  return base || null;
}

function formatArg(value: unknown): string {
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function enqueue(input: AppendLogInput) {
  if (queue.length >= 512) {
    queue.shift();
  }
  queue.push(input);
  scheduleFlush();
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushQueue();
  }, 400);
}

async function flushQueue() {
  if (flushing || queue.length === 0) return;

  const base = postsDbBase();
  const token = POSTS_DB_INTERNAL_TOKEN.trim();
  if (!base || !token) return;

  flushing = true;
  const batch = queue.splice(0, 50);

  try {
    const response = await fetch(`${base}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [INTERNAL_HEADER]: token,
      },
      body: JSON.stringify(batch.length === 1 ? batch[0] : batch),
    });
    if (!response.ok && batch.length > 0) {
      queue.unshift(...batch);
    }
  } catch {
    if (batch.length > 0) {
      queue.unshift(...batch);
    }
  } finally {
    flushing = false;
    if (queue.length > 0) {
      scheduleFlush();
    }
  }
}

export function installLogShip(service: string): void {
  const cleanService = service.trim().toLowerCase();
  if (!cleanService || !postsDbBase() || !POSTS_DB_INTERNAL_TOKEN.trim()) {
    return;
  }

  const original = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };

  const ship = (level: LogLevel, args: unknown[]) => {
    const message = args.map(formatArg).join(' ').trim();
    if (!message) return;
    enqueue({ service: cleanService, level, message });
  };

  console.log = (...args: unknown[]) => {
    original.log(...args);
    ship('info', args);
  };
  console.info = (...args: unknown[]) => {
    original.info(...args);
    ship('info', args);
  };
  console.warn = (...args: unknown[]) => {
    original.warn(...args);
    ship('warn', args);
  };
  console.error = (...args: unknown[]) => {
    original.error(...args);
    ship('error', args);
  };
  console.debug = (...args: unknown[]) => {
    original.debug(...args);
    ship('debug', args);
  };
}
