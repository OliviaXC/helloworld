export interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary?: string;
  description: string;
}

export async function fetchRemotiveJobs(query: string): Promise<RemotiveJob[]> {
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Remotive API error: ${res.status}`);
  }
  const data = await res.json();
  return data.jobs as RemotiveJob[];
}