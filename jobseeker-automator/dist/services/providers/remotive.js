"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRemotiveJobs = fetchRemotiveJobs;
async function fetchRemotiveJobs(query) {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Remotive API error: ${res.status}`);
    }
    const data = await res.json();
    return data.jobs;
}
