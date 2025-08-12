"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = require("fs");
const path_1 = require("path");
const zod_1 = require("zod");
const resumeParser_1 = require("./util/resumeParser");
const searchJobs_1 = require("./services/searchJobs");
const rankJobs_1 = require("./services/rankJobs");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "2mb" }));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
app.get("/", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send((0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), "src", "client", "index.html"), "utf8"));
});
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
const searchSchema = zod_1.z.object({
    jobTitle: zod_1.z.string().min(1),
    industry: zod_1.z.string().optional(),
    payMin: zod_1.z.number().int().nonnegative().optional(),
    payMax: zod_1.z.number().int().nonnegative().optional(),
    location: zod_1.z.string().optional(),
    radiusMiles: zod_1.z.number().int().positive().optional(),
    metroArea: zod_1.z.string().optional(),
    targetRole: zod_1.z.string().optional(),
    providers: zod_1.z.array(zod_1.z.enum(["remotive", "arbeitnow"]))
        .optional(),
    resumeText: zod_1.z.string().optional()
});
app.post("/api/search", upload.none(), async (req, res) => {
    try {
        const parsed = searchSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.flatten() });
        }
        const criteria = parsed.data;
        const jobs = await (0, searchJobs_1.searchJobs)(criteria);
        const ranked = await (0, rankJobs_1.rankJobs)(jobs, {
            resumeText: criteria.resumeText ?? "",
            targetRole: criteria.targetRole ?? criteria.jobTitle
        });
        res.json({ jobs: ranked });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post("/api/upload-resume", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const extension = (0, path_1.extname)(req.file.originalname).toLowerCase();
        const text = await (0, resumeParser_1.parseResumeText)(req.file.buffer, extension);
        res.json({ text });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to parse resume" });
    }
});
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
