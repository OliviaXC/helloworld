"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchJobs = searchJobs;
const remotive_1 = require("./providers/remotive");
const arbeitnow_1 = require("./providers/arbeitnow");
async function searchJobs(criteria) {
    const providers = criteria.providers && criteria.providers.length > 0
        ? criteria.providers
        : ["remotive", "arbeitnow"];
    const results = [];
    if (providers.includes("remotive")) {
        try {
            const remotive = await (0, remotive_1.fetchRemotiveJobs)(criteria.jobTitle);
            for (const job of remotive) {
                results.push({
                    id: `remotive:${job.id}`,
                    title: job.title,
                    company: job.company_name,
                    url: job.url,
                    location: job.candidate_required_location,
                    description: job.description,
                    source: "remotive",
                    publishedAt: job.publication_date,
                    tags: [job.category, job.job_type].filter(Boolean),
                    salaryText: job.salary
                });
            }
        }
        catch { }
    }
    if (providers.includes("arbeitnow")) {
        try {
            const arbeitnow = await (0, arbeitnow_1.fetchArbeitnowJobs)(1);
            for (const job of arbeitnow) {
                results.push({
                    id: `arbeitnow:${job.slug}`,
                    title: job.title,
                    company: job.company_name,
                    url: job.url,
                    location: job.location,
                    description: job.description,
                    source: "arbeitnow",
                    publishedAt: job.created_at,
                    tags: job.tags,
                });
            }
        }
        catch { }
    }
    return results;
}
