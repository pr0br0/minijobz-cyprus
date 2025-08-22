"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  MapPin, 
  Briefcase, 
  Euro, 
  Clock, 
  Building, 
  Filter,
  Grid,
  List,
  Heart,
  Share2,
  Star,
  Zap,
  Users,
  Award
} from "lucide-react";
import Link from "next/link";
import AdvancedSearch, { AdvancedSearchFilters } from "@/components/ui/AdvancedSearch";
import { CyprusCity } from "@/lib/constants/cities";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  remote: "ONSITE" | "HYBRID" | "REMOTE";
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  createdAt: string;
  expiresAt?: string;
  featured: boolean;
  urgent: boolean;
  employer: {
    id: string;
    companyName: string;
    logo?: string;
  };
  skills: Array<{
    id: string;
    name: string;
  }>;
  _count?: {
    applications: number;
  };
  matchScore?: number;
  matchingSkills?: string[];
}

// Using shared AdvancedSearchFilters from component (exported)

export default function JobsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: "",
    location: "",
    remoteType: [],
    jobType: [],
    salaryRange: [0, 200000],
    experience: [],
    industry: [],
    skills: [],
  education: [],
  languages: [],
  benefits: [],
  companySize: [],
    featured: false,
    urgent: false,
    postedWithin: "",
    sortBy: "relevance",
    sortOrder: "desc",
  });

  useEffect(() => {
    fetchJobs();
    if (session?.user?.role === "JOB_SEEKER") {
      fetchRecommendations();
    }
  }, [currentPage, filters, session]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: jobsPerPage.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              acc[key] = value.join(",");
            }
          } else if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>),
      });

      const response = await fetch(`/api/jobs/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
        setTotalJobs(data.total);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/jobs/recommendations?limit=6');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleFiltersChange = (newFilters: AdvancedSearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const formatSalary = (min?: number, max?: number, currency = "EUR") => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getRemoteIcon = (remoteType: string) => {
    switch (remoteType) {
      case "REMOTE": return "🏠";
      case "HYBRID": return "🏢";
      default: return "📍";
    }
  };

  const getExperienceIcon = (experience: string) => {
    switch (experience) {
      case "0": return <Award className="w-4 h-4" />;
      case "2": return <Users className="w-4 h-4" />;
      case "4": return <Star className="w-4 h-4" />;
      case "7": return <Zap className="w-4 h-4" />;
      case "11": return <Award className="w-4 h-4" />;
      default: return null;
    }
  };

  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.remoteType.length,
      filters.jobType.length,
      filters.experience.length,
      filters.industry.length,
      filters.skills.length,
      filters.featured ? 1 : 0,
      filters.urgent ? 1 : 0,
      filters.postedWithin ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
  }, [filters]);

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              {job.title}
              {job.featured && <Badge className="bg-yellow-500 text-white"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
              {job.urgent && <Badge className="bg-red-500 text-white"><Zap className="w-3 h-3 mr-1" />Urgent</Badge>}
              {job.matchScore && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {job.matchScore}% match
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {job.employer.companyName}
              </span>
              <span className="flex items-center gap-1">
                {getRemoteIcon(job.remote)}
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.type.replace('_', ' ')}
              </span>
            </div>
          </div>
          {job.employer.logo && (
            <img 
              src={job.employer.logo} 
              alt={job.employer.companyName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-700 mb-4 line-clamp-3">
          {job.description}
        </CardDescription>
        
        {job.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {job.skills.slice(0, 6).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              ))}
              {job.skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {job.matchingSkills && job.matchingSkills.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-green-600 font-medium mb-2">Matching skills:</p>
            <div className="flex flex-wrap gap-1">
              {job.matchingSkills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs border-green-600 text-green-600">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm">
            {job.salaryMin && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <Euro className="w-4 h-4" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              {formatDate(job.createdAt)}
            </span>
            {job._count?.applications !== undefined && (
              <span className="flex items-center gap-1 text-gray-500">
                <Users className="w-4 h-4" />
                {job._count.applications} applications
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSaveJob(job.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Heart className={`w-4 h-4 ${savedJobs.has(job.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="sm" asChild>
              <Link href={`/jobs/${job.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Cyprus Jobs
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/jobs" className="text-blue-600 font-medium">
                  Browse Jobs
                </Link>
                <Link href="/companies" className="text-gray-600 hover:text-blue-600">
                  Companies
                </Link>
                <Link href="/career-resources" className="text-gray-600 hover:text-blue-600">
                  Resources
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {session.user?.name || session.user?.email}
                  </span>
                  <Link href={session.user?.role === "JOB_SEEKER" ? "/dashboard/job-seeker" : "/dashboard/employer"}>
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/signin">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Recommendations Banner */}
      {session?.user?.role === "JOB_SEEKER" && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="font-medium">Recommended jobs based on your profile</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                {showRecommendations ? "Hide" : "Show"} Recommendations
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-96 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <AdvancedSearch 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {filters.query ? `Search Results for "${filters.query}"` : "All Jobs"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {totalJobs} jobs found
                  {activeFiltersCount > 0 && (
                    <span className="ml-2">
                      • {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            {showRecommendations && recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Recommended for You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((job) => (
                    <JobCard key={`rec-${job.id}`} job={job} />
                  ))}
                </div>
              </div>
            )}

            {/* Jobs Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-10 bg-gray-200 rounded mt-4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or filters to find more opportunities.
                  </p>
                  <Button onClick={() => setFilters({
                    query: "",
                    location: "",
                    remoteType: [],
                    jobType: [],
                    salaryRange: [0, 200000],
                    experience: [],
                    industry: [],
                    skills: [],
                    education: [],
                    languages: [],
                    benefits: [],
                    companySize: [],
                    featured: false,
                    urgent: false,
                    postedWithin: "",
                    sortBy: "relevance",
                    sortOrder: "desc",
                  })}>
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}