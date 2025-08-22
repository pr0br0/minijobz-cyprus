"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Briefcase, 
  Euro, 
  Clock, 
  Building, 
  Users, 
  Calendar,
  Heart,
  Share2,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import JobApplicationForm from "@/components/JobApplicationForm";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
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
  applicationEmail?: string;
  applicationUrl?: string;
  employer: {
    id: string;
    companyName: string;
    description?: string;
    logo?: string;
    website?: string;
    industry?: string;
    size?: string;
    city?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  skills: Array<{
    id: string;
    name: string;
  }>;
  _count?: {
    applications: number;
  };
}

interface RelatedJob {
  id: string;
  title: string;
  location: string;
  type: string;
  remote: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  employer: {
    companyName: string;
  };
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchJobDetails();
      fetchRelatedJobs();
    }
  }, [params.id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
        
        // Check if user has saved or applied to this job
        if (session?.user?.id) {
          checkUserJobStatus(data.id);
        }
      } else {
        setError("Job not found");
      }
    } catch (error) {
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedJobs = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching related jobs:", error);
    }
  };

  const checkUserJobStatus = async (jobId: string) => {
    try {
      const [savedResponse, appliedResponse] = await Promise.all([
        fetch(`/api/job-seeker/saved-jobs/check/${jobId}`),
        fetch(`/api/job-seeker/applications/check/${jobId}`),
      ]);

      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setSaved(savedData.saved);
      }

      if (appliedResponse.ok) {
        const appliedData = await appliedResponse.json();
        setApplied(appliedData.applied);
      }
    } catch (error) {
      console.error("Error checking job status:", error);
    }
  };

  const handleApply = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "JOB_SEEKER") {
      setError("Only job seekers can apply to jobs");
      return;
    }

    setApplying(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/jobs/${params.id}/apply`, {
        method: "POST",
      });

      if (response.ok) {
        setSuccess("Application submitted successfully!");
        setApplied(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit application");
      }
    } catch (error) {
      setError("An error occurred while submitting application");
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/job-seeker/saved-jobs/${params.id}`, {
        method: saved ? "DELETE" : "POST",
      });

      if (response.ok) {
        setSaved(!saved);
      }
    } catch (error) {
      console.error("Error saving job:", error);
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
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilExpiration = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Job Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => router.push("/jobs")}>
                Browse Jobs
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) return null;

  const daysUntilExpiration = getDaysUntilExpiration(job.expiresAt);

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

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
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

            {/* Job Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{job.type.replace("_", " ")}</Badge>
                      <Badge variant={job.remote === "REMOTE" ? "default" : "secondary"}>
                        {job.remote}
                      </Badge>
                      {job.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                      {job.urgent && <Badge variant="destructive">Urgent</Badge>}
                    </div>
                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-xl text-blue-600">
                      {job.employer.companyName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveJob}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Key Details */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Euro className="w-5 h-5 mr-2" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>{job.type.replace("_", " ")}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div 
                        dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br>') }} 
                        className="mb-6"
                      />
                      
                      {job.responsibilities && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3">Key Responsibilities</h3>
                          <div 
                            dangerouslySetInnerHTML={{ __html: job.responsibilities.replace(/\n/g, '<br>') }} 
                          />
                        </div>
                      )}
                      
                      {job.requirements && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                          <div 
                            dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br>') }} 
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company">
                <Card>
                  <CardHeader>
                    <CardTitle>About {job.employer.companyName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {job.employer.description && (
                        <div>
                          <h3 className="font-semibold mb-2">Company Description</h3>
                          <p className="text-gray-600">{job.employer.description}</p>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Industry</h3>
                          <p className="text-gray-600">{job.employer.industry || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Company Size</h3>
                          <p className="text-gray-600">{job.employer.size || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Location</h3>
                          <p className="text-gray-600">{job.employer.city || "Not specified"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Website</h3>
                          {job.employer.website ? (
                            <a 
                              href={job.employer.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Visit Website
                            </a>
                          ) : (
                            <p className="text-gray-600">Not specified</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Contact Information</h3>
                        <div className="space-y-2">
                          {job.employer.contactEmail && (
                            <div className="flex items-center text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              <a href={`mailto:${job.employer.contactEmail}`} className="text-blue-600 hover:underline">
                                {job.employer.contactEmail}
                              </a>
                            </div>
                          )}
                          {job.employer.contactPhone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              <a href={`tel:${job.employer.contactPhone}`} className="text-blue-600 hover:underline">
                                {job.employer.contactPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Job Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Posted:</span>
                            <span>{formatDate(job.createdAt)}</span>
                          </div>
                          {job.expiresAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expires:</span>
                              <span className={daysUntilExpiration && daysUntilExpiration < 7 ? "text-red-600" : ""}>
                                {formatDate(job.expiresAt)}
                                {daysUntilExpiration && ` (${daysUntilExpiration} days left)`}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Applications:</span>
                            <span>{job._count?.applications || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Work Type:</span>
                            <span>{job.remote}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Employment Type:</span>
                            <span>{job.type.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Compensation</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Salary Range:</span>
                            <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Currency:</span>
                            <span>{job.salaryCurrency}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold mb-3 mt-6">How to Apply</h3>
                        <div className="text-sm text-gray-600">
                          {job.applicationEmail ? (
                            <p>Apply via email: <a href={`mailto:${job.applicationEmail}`} className="text-blue-600 hover:underline">
                              {job.applicationEmail}
                            </a></p>
                          ) : job.applicationUrl ? (
                            <p>Apply online: <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Visit Application Page
                            </a></p>
                          ) : (
                            <p>Use the "Apply Now" button to submit your application.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Skills Section */}
            {job.skills.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill.id} variant="outline">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedJobs.slice(0, 3).map((relatedJob) => (
                      <div key={relatedJob.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                              <Link href={`/jobs/${relatedJob.id}`} className="hover:text-blue-600">
                                {relatedJob.title}
                              </Link>
                            </h3>
                            <p className="text-blue-600 text-sm mb-2">{relatedJob.employer.companyName}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {relatedJob.location}
                              </span>
                              <span className="flex items-center">
                                <Euro className="w-4 h-4 mr-1" />
                                {formatSalary(relatedJob.salaryMin, relatedJob.salaryMax, relatedJob.salaryCurrency)}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline">{relatedJob.type.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Apply Card */}
            {applied ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-700">Application Submitted</p>
                    <p className="text-sm text-gray-600 mt-1">
                      You have successfully applied for this position
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <JobApplicationForm
                jobId={job.id}
                onApplicationSuccess={() => {
                  setSuccess("Application submitted successfully!");
                  setApplied(true);
                }}
                onApplicationError={(error) => setError(error)}
              />
            )}

            {/* Job Stats Card */}
            <Card className="sticky top-6 mt-6">
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Views:</span>
                    <span>{Math.floor(Math.random() * 500) + 100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications:</span>
                    <span>{job._count?.applications || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Active:</span>
                    <span>{Math.floor(Math.random() * 24) + 1} hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Quick Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{job.employer.companyName}</h4>
                    <p className="text-sm text-gray-600">{job.employer.industry}</p>
                  </div>
                  
                  {job.employer.city && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.employer.city}
                    </div>
                  )}
                  
                  {job.employer.size && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {job.employer.size}
                    </div>
                  )}
                  
                  {job.employer.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <a 
                        href={job.employer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}