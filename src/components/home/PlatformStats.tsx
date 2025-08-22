"use client";
import { useEffect, useState } from "react";

export function PlatformStats() {
  const [stats, setStats] = useState({
    seekers: "1,000+",
    companies: "50+",
    jobs: "200+",
    success: "85%",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setStats({
              seekers: `${data.overview.totalJobSeekers}+`,
              companies: `${data.overview.totalCompanies}+`,
              jobs: `${data.overview.activeJobs}+`,
              success: `${data.overview.successRate}%`,
            });
          }
        }
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const items = [
    { label: "Active Job Seekers", value: stats.seekers },
    { label: "Companies Hiring", value: stats.companies },
    { label: "Jobs Posted", value: stats.jobs },
    { label: "Success Rate", value: stats.success },
  ];

  return (
    <section className="py-16 bg-white" aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8" role="list">
          {items.map(i => (
            <div key={i.label} role="listitem" className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{loading ? "…" : i.value}</div>
              <div className="text-gray-600 text-sm md:text-base">{i.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
