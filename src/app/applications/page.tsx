"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLocation: string;
  status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED" | "HIRED";
  appliedAt: string;
  coverLetter?: string;
  jobType: string;
  salary?: string;
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "JOB_SEEKER") {
      router.push("/dashboard/employer");
      return;
    }

    if (status === "authenticated") {
      fetchApplications();
    }
  }, [status, session, router]);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/job-seeker/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError("Failed to fetch applications");
      }
    } catch (error) {
      setError("An error occurred while fetching applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800";
      case "SHORTLISTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "HIRED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "REVIEWED":
        return <Eye className="w-4 h-4" />;
      case "SHORTLISTED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "HIRED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error && !applications.length) {
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
            <Button className="w-full mt-4" onClick={() => router.push("/dashboard/job-seeker")}>
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
                <Link href="/dashboard/job-seeker" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/jobs" className="text-gray-600 hover:text-blue-600">
                  Browse Jobs
                </Link>
                <Link href="/applications" className="text-blue-600 font-medium">
                  My Applications
                </Link>
                <Link href="/job-alerts" className="text-gray-600 hover:text-blue-600">
                  Job Alerts
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't applied to any jobs yet. Start browsing and apply to positions that match your skills.
              </p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                All ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="PENDING">
                Pending ({getApplicationsByStatus("PENDING").length})
              </TabsTrigger>
              <TabsTrigger value="REVIEWED">
                Reviewed ({getApplicationsByStatus("REVIEWED").length})
              </TabsTrigger>
              <TabsTrigger value="SHORTLISTED">
                Shortlisted ({getApplicationsByStatus("SHORTLISTED").length})
              </TabsTrigger>
              <TabsTrigger value="REJECTED">
                Rejected ({getApplicationsByStatus("REJECTED").length})
              </TabsTrigger>
              <TabsTrigger value="HIRED">
                Hired ({getApplicationsByStatus("HIRED").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6">
                {applications.map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
              </div>
            </TabsContent>

            {["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"].map((status) => (
              <TabsContent key={status} value={status} className="mt-6">
                <div className="grid gap-6">
                  {getApplicationsByStatus(status).map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800";
      case "SHORTLISTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "HIRED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "REVIEWED":
        return <Eye className="w-4 h-4" />;
      case "SHORTLISTED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "HIRED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
              <Badge className={getStatusColor(application.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(application.status)}
                  {application.status}
                </div>
              </Badge>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {application.companyName}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {application.companyLocation}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {application.jobType}
              </div>
              {application.salary && (
                <div className="flex items-center gap-1">
                  <span>{application.salary}</span>
                </div>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-500 gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied {new Date(application.appliedAt).toLocaleDateString()}
              </div>
            </div>

            {application.coverLetter && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Cover Letter</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {application.coverLetter}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <Link href={`/jobs/${application.jobId}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Job
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}