"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installLogShip = installLogShip;
const INTERNAL_HEADER = 'X-Posts-Db-Internal-Token';
const queue = [];
let flushTimer = null;
let flushing = false;
function postsDbBase() {
    const base = String(process.env.POSTS_DB_URL ?? '')
        .trim()
        .replace(/\/+$/g, '');
    return base || null;
}
function postsDbToken() {
    return String(process.env.POSTS_DB_INTERNAL_TOKEN ?? '').trim();
}
function formatArg(value) {
    if (value instanceof Error) {
        return value.stack ?? value.message;
    }
    if (typeof value === 'string') {
        return value;
    }
    try {
        return JSON.stringify(value);
    }
    catch {
        return String(value);
    }
}
function enqueue(input) {
    if (queue.length >= 512) {
        queue.shift();
    }
    queue.push(input);
    scheduleFlush();
}
function scheduleFlush() {
    if (flushTimer)
        return;
    flushTimer = setTimeout(() => {
        flushTimer = null;
        void flushQueue();
    }, 400);
}
async function flushQueue() {
    if (flushing || queue.length === 0)
        return;
    const base = postsDbBase();
    const token = postsDbToken();
    if (!base || !token)
        return;
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
    }
    catch {
        if (batch.length > 0) {
            queue.unshift(...batch);
        }
    }
    finally {
        flushing = false;
        if (queue.length > 0) {
            scheduleFlush();
        }
    }
}
function installLogShip(service) {
    const cleanService = service.trim().toLowerCase();
    if (!cleanService || !postsDbBase() || !postsDbToken()) {
        return;
    }
    const original = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console),
    };
    const ship = (level, args) => {
        const message = args.map(formatArg).join(' ').trim();
        if (!message)
            return;
        enqueue({ service: cleanService, level, message });
    };
    console.log = (...args) => {
        original.log(...args);
        ship('info', args);
    };
    console.info = (...args) => {
        original.info(...args);
        ship('info', args);
    };
    console.warn = (...args) => {
        original.warn(...args);
        ship('warn', args);
    };
    console.error = (...args) => {
        original.error(...args);
        ship('error', args);
    };
    console.debug = (...args) => {
        original.debug(...args);
        ship('debug', args);
    };
}
