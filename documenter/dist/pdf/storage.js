"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistArticlePdf = persistArticlePdf;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const zod_1 = require("zod");
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
async function persistArticlePdf(payloadInput, root = (0, node_path_1.join)(process.cwd(), 'public/data/series')) {
    const payload = normalizePayload(payloadInput);
    const serie = requireSegment(payload.serie ?? payload.series, 'serie');
    const chapter = requireSegment(payload.chapter ?? payload.section, 'chapter');
    const folder = requireSegment(payload.folder_name ?? payload.article_id, 'folder_name');
    const articleDir = (0, node_path_1.join)(root, serie, chapter, folder);
    await (0, promises_1.mkdir)(articleDir, { recursive: true });
    const pdfBuffer = await (0, generatePdf_js_1.generateArticlePdf)(payload);
    const filename = 'document.pdf';
    const absolutePath = (0, node_path_1.join)(articleDir, (0, node_path_1.basename)(filename));
    await (0, promises_1.writeFile)(absolutePath, pdfBuffer);
    return {
        storagePath: `${serie}/${chapter}/${folder}`,
        absolutePath,
        publicPath: `/data/series/${serie}/${chapter}/${folder}/${filename}`,
        bytes: pdfBuffer.length,
    };
}
