import express from "express";
import cors from "cors";
import multer from "multer";
import { readFileSync } from "fs";
import { extname, join } from "path";
import { z } from "zod";
import { parseResumeText } from "./util/resumeParser";
import { searchJobs } from "./services/searchJobs";
import { rankJobs } from "./services/rankJobs";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(readFileSync(join(process.cwd(), "src", "client", "index.html"), "utf8"));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const searchSchema = z.object({
  jobTitle: z.string().min(1),
  industry: z.string().optional(),
  payMin: z.number().int().nonnegative().optional(),
  payMax: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
  radiusMiles: z.number().int().positive().optional(),
  metroArea: z.string().optional(),
  targetRole: z.string().optional(),
  providers: z.array(z.enum(["remotive", "arbeitnow"]))
    .optional(),
  resumeText: z.string().optional()
});

app.post("/api/search", upload.none(), async (req, res) => {
  try {
    const parsed = searchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const criteria = parsed.data;
    const jobs = await searchJobs(criteria);
    const ranked = await rankJobs(jobs, {
      resumeText: criteria.resumeText ?? "",
      targetRole: criteria.targetRole ?? criteria.jobTitle
    });
    res.json({ jobs: ranked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/upload-resume", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const extension = extname(req.file.originalname).toLowerCase();
    const text = await parseResumeText(req.file.buffer, extension);
    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to parse resume" });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});