"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Pause, 
  Play,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  location: string;
  remote: "ONSITE" | "HYBRID" | "REMOTE";
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  status: "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED" | "EXPIRED";
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
  featured: boolean;
  urgent: boolean;
  _count: {
    applications: number;
  };
}

export default function ManageJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?role=EMPLOYER");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "EMPLOYER") {
      router.push("/dashboard/job-seeker");
      return;
    }

    if (status === "authenticated") {
      fetchJobs();
    }
  }, [status, session, router]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/employer/jobs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (error) {
      setError("An error occurred while fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setSuccess(`Job ${action}d successfully`);
        fetchJobs();
      } else {
        const data = await response.json();
        setError(data.error || `Failed to ${action} job`);
      }
    } catch (error) {
      setError(`An error occurred while ${action}ing the job`);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Job deleted successfully");
        fetchJobs();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete job");
      }
    } catch (error) {
      setError("An error occurred while deleting the job");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-blue-100 text-blue-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatSalary = (min?: number, max?: number, currency = "EUR") => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return "";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredJobs = jobs.filter(job => {
    if (statusFilter === "all") return true;
    return job.status === statusFilter;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Job];
    let bValue: any = b[sortBy as keyof Job];

    if (sortBy === "createdAt" || sortBy === "publishedAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const stats = {
    total: jobs.length,
    published: jobs.filter(j => j.status === "PUBLISHED").length,
    draft: jobs.filter(j => j.status === "DRAFT").length,
    paused: jobs.filter(j => j.status === "PAUSED").length,
    totalApplications: jobs.reduce((sum, job) => sum + job._count.applications, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error && !jobs.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => router.push("/dashboard/employer")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Link href="/dashboard/employer" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/jobs/post" className="text-gray-600 hover:text-blue-600">
                  Post a Job
                </Link>
                <Link href="/jobs/manage" className="text-blue-600 font-medium">
                  Manage Jobs
                </Link>
                <Link href="/applications" className="text-gray-600 hover:text-blue-600">
                  Applications
                </Link>
                <Link href="/billing" className="text-gray-600 hover:text-blue-600">
                  Billing
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name || session?.user?.email}
              </span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Jobs</h1>
            <p className="text-gray-600">Create, edit, and manage your job postings</p>
          </div>
          <Link href="/jobs/post">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold">{stats.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Pause className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paused</p>
                  <p className="text-2xl font-bold">{stats.paused}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Edit className="w-8 h-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search jobs by title or location..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="publishedAt-desc">Recently Published</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="PUBLISHED">Published ({stats.published})</TabsTrigger>
            <TabsTrigger value="DRAFT">Drafts ({stats.draft})</TabsTrigger>
            <TabsTrigger value="PAUSED">Paused ({stats.paused})</TabsTrigger>
            <TabsTrigger value="CLOSED">Closed</TabsTrigger>
            <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
          </TabsList>

          {["all", "PUBLISHED", "DRAFT", "PAUSED", "CLOSED", "EXPIRED"].map((status) => (
            <TabsContent key={status} value={status}>
              {sortedJobs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600 mb-6">
                      {status === "all" 
                        ? "You haven't posted any jobs yet." 
                        : `You don't have any ${status.toLowerCase()} jobs.`
                      }
                    </p>
                    <Link href="/jobs/post">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">{job.title}</h3>
                                  <Badge className={getStatusColor(job.status)}>
                                    {job.status}
                                  </Badge>
                                  {job.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                                  {job.urgent && <Badge variant="destructive">Urgent</Badge>}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {job.location}
                                  </div>
                                  <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1" />
                                    {job.type.replace("_", " ")}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-1">💶</span>
                                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Created: {formatDate(job.createdAt)}
                                  </div>
                                  {job.publishedAt && (
                                    <div className="flex items-center">
                                      <TrendingUp className="w-4 h-4 mr-1" />
                                      Published: {formatDate(job.publishedAt)}
                                    </div>
                                  )}
                                  {job.expiresAt && (
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Expires: {formatDate(job.expiresAt)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Users className="w-4 h-4 mr-1" />
                                  {job._count.applications} applications
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Link href={`/jobs/${job.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                </Link>
                                
                                <Link href={`/jobs/${job.id}/edit`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Button>
                                </Link>

                                {job.status === "PUBLISHED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleJobAction(job.id, "pause")}
                                  >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                  </Button>
                                )}

                                {job.status === "PAUSED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleJobAction(job.id, "publish")}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Publish
                                  </Button>
                                )}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}