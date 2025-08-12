import { fetchRemotiveJobs } from "./providers/remotive";
import { fetchArbeitnowJobs } from "./providers/arbeitnow";

export interface SearchCriteria {
  jobTitle: string;
  industry?: string;
  payMin?: number;
  payMax?: number;
  location?: string;
  radiusMiles?: number;
  metroArea?: string;
  targetRole?: string;
  providers?: ("remotive" | "arbeitnow")[];
}

export interface NormalizedJobPosting {
  id: string;
  title: string;
  company: string;
  url: string;
  location?: string;
  description: string;
  source: string;
  publishedAt?: string;
  tags?: string[];
  salaryText?: string;
}

export async function searchJobs(criteria: SearchCriteria): Promise<NormalizedJobPosting[]> {
  const providers = criteria.providers && criteria.providers.length > 0
    ? criteria.providers
    : ["remotive", "arbeitnow"] as const;

  const results: NormalizedJobPosting[] = [];

  if (providers.includes("remotive")) {
    try {
      const remotive = await fetchRemotiveJobs(criteria.jobTitle);
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
    } catch {}
  }

  if (providers.includes("arbeitnow")) {
    try {
      const arbeitnow = await fetchArbeitnowJobs(1);
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
    } catch {}
  }

  return results;
}