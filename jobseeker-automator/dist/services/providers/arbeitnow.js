"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchArbeitnowJobs = fetchArbeitnowJobs;
async function fetchArbeitnowJobs(page = 1) {
    const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Arbeitnow API error: ${res.status}`);
    }
    const data = await res.json();
    return (data.data || []);
}
