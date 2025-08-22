"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Euro, Users, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export interface FeaturedJob {
  id: string;
  title: string;
  description: string;
  location: string;
  remote: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  featured: boolean;
  urgent: boolean;
  employer: { id: string; companyName: string; logo: string | null };
  _count: { applications: number };
}

interface FeaturedJobsProps {
  limit?: number;
}

export function FeaturedJobs({ limit = 6 }: FeaturedJobsProps) {
  const [jobs, setJobs] = useState<FeaturedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await fetch(`/api/jobs/search?featured=true&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error("Error fetching featured jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, [limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy>
        {Array.from({ length: limit }).map((_, i) => (
          <Card key={i} className="animate-pulse" aria-hidden>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <div className="text-center py-12" role="status">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Jobs Available</h3>
        <p className="text-gray-600">Check back soon for new opportunities!</p>
        <Link href="/jobs" className="inline-block mt-6">
          <Button variant="outline">Browse All Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" role="list">
      {jobs.map(job => (
        <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" role="listitem">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2 line-clamp-2" title={job.title}>{job.title}</CardTitle>
                <CardDescription className="flex items-center text-gray-600">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {job.employer.companyName}
                </CardDescription>
              </div>
              {job.featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {job.location}
                {job.remote && <Badge variant="outline" className="ml-2">Remote</Badge>}
              </div>
              {job.salaryMin && job.salaryMax && (
                <div className="flex items-center text-sm text-green-600">
                  <Euro className="w-4 h-4 mr-2" />
                  {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.salaryCurrency}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {job._count.applications} applications
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2" title={job.description}>{job.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
