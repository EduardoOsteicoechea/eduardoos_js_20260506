"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistArticlePdf = persistArticlePdf;
const zod_1 = require("zod");
const s3Client_js_1 = require("../s3Client.js");
const generatePdf_js_1 = require("./generatePdf.js");
const articlePayloadSchema = zod_1.z.object({
    serie: zod_1.z.string().optional(),
    series: zod_1.z.string().optional(),
    chapter: zod_1.z.string().optional(),
    section: zod_1.z.string().optional(),
    article_id: zod_1.z.string().optional(),
    folder_name: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    creator: zod_1.z.string().optional(),
    sections: zod_1.z.array(zod_1.z.object({}).passthrough()).optional(),
});
function sanitizeSegment(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}
function requireSegment(raw, fieldName) {
    const value = sanitizeSegment(String(raw ?? ''));
    if (!value)
        throw new Error(`Campo inválido: ${fieldName}`);
    return value;
}
function normalizePayload(payloadInput) {
    const parsed = articlePayloadSchema.safeParse(payloadInput);
    if (!parsed.success) {
        throw new Error('Payload de artículo inválido');
    }
    const payload = payloadInput;
    const rawSections = Array.isArray(payload.sections) ? payload.sections : [];
    const sections = rawSections
        .filter((item) => item && typeof item === 'object')
        .map((item) => item);
    return {
        ...parsed.data,
        sections,
    };
}
async function persistArticlePdf(payloadInput) {
    if (!(0, s3Client_js_1.isS3Configured)()) {
        throw new Error('S3 service is not configured for documenter');
    }
    const payload = normalizePayload(payloadInput);
    const serie = requireSegment(payload.serie ?? payload.series, 'serie');
    const chapter = requireSegment(payload.chapter ?? payload.section, 'chapter');
    const folder = requireSegment(payload.folder_name ?? payload.article_id, 'folder_name');
    const pdfBuffer = await (0, generatePdf_js_1.generateArticlePdf)(payload);
    const prefix = `documents/${serie}/${chapter}/${folder}`;
    const uploaded = await (0, s3Client_js_1.uploadS3Buffer)(pdfBuffer, 'document.pdf', prefix, 'application/pdf');
    return {
        storagePath: `${serie}/${chapter}/${folder}`,
        key: uploaded.key,
        url: uploaded.url,
        publicPath: uploaded.url,
        bytes: uploaded.size,
    };
}
