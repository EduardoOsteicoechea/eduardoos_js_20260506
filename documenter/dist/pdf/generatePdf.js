"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArticlePdf = generateArticlePdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
const node_stream_1 = require("node:stream");
function toParagraph(value) {
    return typeof value === 'string' ? value.trim() : '';
}
function extractBlockText(block) {
    if (!block || typeof block !== 'object')
        return [];
    const record = block;
    if (typeof record.paragraph === 'string')
        return [record.paragraph];
    if (typeof record.heading === 'string')
        return [record.heading];
    if (typeof record.quote === 'string')
        return [record.quote];
    if (Array.isArray(record.list)) {
        return record.list
            .map((item) => {
            if (typeof item === 'string')
                return `• ${item}`;
            if (!item || typeof item !== 'object')
                return '';
            const itemRecord = item;
            const content = toParagraph(itemRecord.content);
            const emphasized = toParagraph(itemRecord.emphasized);
            const merged = [content, emphasized].filter(Boolean).join(' ');
            return merged ? `• ${merged}` : '';
        })
            .filter(Boolean);
    }
    if (typeof record.text === 'string') {
        const href = toParagraph(record.href);
        return [href ? `${record.text} (${href})` : record.text];
    }
    return [];
}
function collectParagraphs(payload) {
    const sections = Array.isArray(payload.sections) ? payload.sections : [];
    const paragraphs = [];
    for (const section of sections) {
        const heading = toParagraph(section.heading);
        if (heading)
            paragraphs.push(heading);
        const content = Array.isArray(section.content) ? section.content : [];
        for (const block of content) {
            paragraphs.push(...extractBlockText(block));
        }
    }
    return paragraphs.filter(Boolean);
}
function bufferFromDocument(doc) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const stream = doc.pipe(new node_stream_1.PassThrough());
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
        doc.on('error', reject);
        doc.end();
    });
}
async function generateArticlePdf(payload) {
    const doc = new pdfkit_1.default({
        size: 'LETTER',
        margins: { top: 64, left: 64, right: 64, bottom: 64 },
    });
    const title = toParagraph(payload.title) || 'Documento';
    const creator = toParagraph(payload.creator);
    const paragraphs = collectParagraphs(payload);
    doc.fontSize(20).text(title, { align: 'left' });
    if (creator) {
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#4b5563').text(`Autor: ${creator}`);
        doc.fillColor('#111111');
    }
    doc.moveDown(1);
    doc.fontSize(11);
    if (!paragraphs.length) {
        doc.text('Sin contenido.');
    }
    else {
        for (const paragraph of paragraphs) {
            doc.text(paragraph, { width: 470, lineGap: 3 });
            doc.moveDown(0.6);
        }
    }
    return bufferFromDocument(doc);
}
