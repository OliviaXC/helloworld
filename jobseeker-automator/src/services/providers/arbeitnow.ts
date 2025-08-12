export interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  created_at: string;
  location: string;
}

export async function fetchArbeitnowJobs(page: number = 1): Promise<ArbeitnowJob[]> {
  const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Arbeitnow API error: ${res.status}`);
  }
  const data = await res.json();
  return (data.data || []) as ArbeitnowJob[];
}