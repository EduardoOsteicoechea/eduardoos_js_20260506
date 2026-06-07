"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pdfHandlers_js_1 = require("./handlers/pdfHandlers.js");
const logship_js_1 = require("./logship.js");
(0, logship_js_1.installLogShip)('documenter');
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 8090);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.get('/health', (_req, res) => {
    return res.json({
        ok: true,
        service: 'documenter',
    });
});
app.post('/documents/article-pdf', pdfHandlers_js_1.generateArticlePdfHandler);
app.listen(PORT, () => {
    console.log(`Documenter API running on port ${PORT}`);
});
