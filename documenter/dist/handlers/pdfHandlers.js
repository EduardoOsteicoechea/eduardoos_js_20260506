"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArticlePdfHandler = generateArticlePdfHandler;
const storage_js_1 = require("../pdf/storage.js");
async function generateArticlePdfHandler(req, res) {
    try {
        const result = await (0, storage_js_1.persistArticlePdf)(req.body);
        return res.json({
            ok: true,
            message: 'PDF generado',
            ...result,
        });
    }
    catch (error) {
        console.error('[documenter/pdf]', error);
        return res.status(400).json({
            ok: false,
            error: error instanceof Error ? error.message : 'No se pudo generar el PDF',
        });
    }
}
