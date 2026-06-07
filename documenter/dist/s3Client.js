"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isS3Configured = isS3Configured;
exports.uploadS3Buffer = uploadS3Buffer;
const S3_URL = (process.env.S3_URL ?? 'http://127.0.0.1:8130').replace(/\/+$/g, '');
const S3_INTERNAL_TOKEN = process.env.S3_INTERNAL_TOKEN ?? '';
function isS3Configured() {
    return Boolean(S3_URL && S3_INTERNAL_TOKEN);
}
async function uploadS3Buffer(buffer, filename, prefix, contentType) {
    if (!isS3Configured()) {
        throw new Error('S3 service is not configured');
    }
    const form = new FormData();
    form.append('file', new Blob([Uint8Array.from(buffer)], { type: contentType }), filename);
    if (prefix.trim()) {
        form.append('prefix', prefix.trim());
    }
    const response = await fetch(`${S3_URL}/upload`, {
        method: 'POST',
        headers: {
            'X-S3-Internal-Token': S3_INTERNAL_TOKEN,
        },
        body: form,
    });
    const data = (await response.json().catch(() => ({})));
    if (!response.ok || !data.ok || !data.key || !data.url) {
        throw new Error(data.error ?? `S3 upload failed (${response.status})`);
    }
    return {
        key: data.key,
        url: data.url,
        size: data.size ?? buffer.length,
    };
}
