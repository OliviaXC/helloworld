import { NormalizedJobPosting } from "./searchJobs";

interface RankContext {
  resumeText: string;
  targetRole?: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildTfidfVectors(documents: string[]): { vectors: Map<string, number>[]; idf: Map<string, number> } {
  const tokenized = documents.map(tokenize);
  const df = new Map<string, number>();
  for (const tokens of tokenized) {
    const unique = new Set(tokens);
    for (const token of unique) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  const N = documents.length;
  for (const [term, dfi] of df.entries()) {
    idf.set(term, Math.log((N + 1) / (dfi + 1)) + 1);
  }
  const vectors = tokenized.map(tokens => {
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    const maxTf = Math.max(...Array.from(tf.values()), 1);
    const vec = new Map<string, number>();
    for (const [t, f] of tf.entries()) {
      vec.set(t, (0.5 + 0.5 * (f / maxTf)) * (idf.get(t) ?? 0));
    }
    return vec;
  });
  return { vectors, idf };
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [k, va] of a.entries()) {
    normA += va * va;
    const vb = b.get(k) ?? 0;
    dot += va * vb;
  }
  for (const vb of b.values()) normB += vb * vb;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function rankJobs(jobs: NormalizedJobPosting[], ctx: RankContext) {
  const roleHint = ctx.targetRole ? ` ${ctx.targetRole} ` : "";
  const docs = jobs.map(j => `${j.title} ${j.description} ${j.tags?.join(" ") ?? ""} ${roleHint}`);
  const resumeDoc = ctx.resumeText || roleHint;
  const { vectors, idf } = buildTfidfVectors([...docs, resumeDoc]);
  const resumeVec = vectors[vectors.length - 1];

  const scored = jobs.map((job, idx) => {
    const jobVec = vectors[idx];
    const similarity = cosine(jobVec, resumeVec);

    // Heuristics: boost if title contains targetRole keyword
    let heuristic = 0;
    if (ctx.targetRole) {
      const title = job.title.toLowerCase();
      const target = ctx.targetRole.toLowerCase();
      if (title.includes(target)) heuristic += 0.1;
    }

    // Simple salary heuristic (if present in text)
    let salaryBoost = 0;
    if (job.salaryText) salaryBoost += 0.05;

    const score = Math.min(1, similarity + heuristic + salaryBoost);
    return { ...job, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}