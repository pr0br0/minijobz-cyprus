"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  Mail,
  Phone,
  User,
  Star,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  jobLocation: string;
  jobType: string;
  jobSalary: string;
  jobStatus: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location: string;
    title?: string;
    experience?: number;
    bio?: string;
    cvUrl?: string;
    skills: Array<{
      id: string;
      name: string;
      level: string;
    }>;
  };
  status: "APPLIED" | "VIEWED" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED" | "WITHDRAWN";
  appliedAt: string;
  viewedAt?: string;
  respondedAt?: string;
  coverLetter?: string;
  notes?: string;
}

interface Job {
  id: string;
  title: string;
  status: string;
  _count: {
    applications: number;
  };
}

export default function EmployerApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("appliedAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [updatingApplication, setUpdatingApplication] = useState<string | null>(null);
  const [notesDialog, setNotesDialog] = useState<{open: boolean; applicationId: string; notes: string}>({open: false, applicationId: "", notes: ""});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "EMPLOYER") {
      router.push("/dashboard/job-seeker");
      return;
    }

    if (status === "authenticated") {
      fetchJobs();
      fetchApplications();
    }
  }, [status, session, router, selectedJob, selectedStatus, sortBy, sortOrder]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/employer/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        sortBy,
        sortOrder,
      });

      if (selectedJob) params.append("jobId", selectedJob);
      if (selectedStatus) params.append("status", selectedStatus);

      const response = await fetch(`/api/employer/applications/manage?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setStatusCounts(data.filters?.status || {});
      } else {
        setError("Failed to fetch applications");
      }
    } catch (error) {
      setError("An error occurred while fetching applications");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingApplication(applicationId);
    try {
      const response = await fetch(`/api/employer/applications/manage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        await fetchApplications();
        toast.success(`Application status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update application status");
      }
    } catch (error) {
      toast.error("An error occurred while updating application status");
    } finally {
      setUpdatingApplication(null);
    }
  };

  const updateApplicationNotes = async () => {
    try {
      const response = await fetch(`/api/employer/applications/manage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: notesDialog.applicationId,
          notes: notesDialog.notes,
        }),
      });

      if (response.ok) {
        await fetchApplications();
        setNotesDialog({open: false, applicationId: "", notes: ""});
        toast.success("Application notes updated successfully");
      } else {
        toast.error("Failed to update application notes");
      }
    } catch (error) {
      toast.error("An error occurred while updating application notes");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-yellow-100 text-yellow-800";
      case "VIEWED":
        return "bg-blue-100 text-blue-800";
      case "SHORTLISTED":
        return "bg-green-100 text-green-800";
      case "INTERVIEW":
        return "bg-purple-100 text-purple-800";
      case "OFFERED":
        return "bg-indigo-100 text-indigo-800";
      case "HIRED":
        return "bg-emerald-100 text-emerald-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPLIED":
        return <Clock className="w-4 h-4" />;
      case "VIEWED":
        return <Eye className="w-4 h-4" />;
      case "SHORTLISTED":
        return <Star className="w-4 h-4" />;
      case "INTERVIEW":
        return <MessageSquare className="w-4 h-4" />;
      case "OFFERED":
        return <Briefcase className="w-4 h-4" />;
      case "HIRED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "WITHDRAWN":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (searchTerm === "") return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      app.applicant.name.toLowerCase().includes(searchLower) ||
      app.applicant.email.toLowerCase().includes(searchLower) ||
      app.jobTitle.toLowerCase().includes(searchLower) ||
      app.applicant.skills.some(skill => skill.name.toLowerCase().includes(searchLower))
    );
  });

  const getApplicationsByStatus = (status: string) => {
    return filteredApplications.filter(app => app.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
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
                <Link href="/dashboard/employer" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/jobs/post" className="text-gray-600 hover:text-blue-600">
                  Post a Job
                </Link>
                <Link href="/dashboard/employer/applications" className="text-blue-600 font-medium">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications Management</h1>
          <p className="text-gray-600">Review and manage applications to your job postings</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Jobs</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} ({job._count.applications})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="APPLIED">Applied ({statusCounts.APPLIED || 0})</SelectItem>
                    <SelectItem value="VIEWED">Viewed ({statusCounts.VIEWED || 0})</SelectItem>
                    <SelectItem value="SHORTLISTED">Shortlisted ({statusCounts.SHORTLISTED || 0})</SelectItem>
                    <SelectItem value="INTERVIEW">Interview ({statusCounts.INTERVIEW || 0})</SelectItem>
                    <SelectItem value="OFFERED">Offered ({statusCounts.OFFERED || 0})</SelectItem>
                    <SelectItem value="HIRED">Hired ({statusCounts.HIRED || 0})</SelectItem>
                    <SelectItem value="REJECTED">Rejected ({statusCounts.REJECTED || 0})</SelectItem>
                    <SelectItem value="WITHDRAWN">Withdrawn ({statusCounts.WITHDRAWN || 0})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appliedAt">Application Date</SelectItem>
                    <SelectItem value="applicant.name">Applicant Name</SelectItem>
                    <SelectItem value="jobTitle">Job Title</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search applicants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-6">
                {applications.length === 0 
                  ? "You haven't received any applications yet." 
                  : "No applications match your current filters."
                }
              </p>
              {applications.length === 0 && (
                <Link href="/jobs/post">
                  <Button>Post a Job</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="all">
                All ({filteredApplications.length})
              </TabsTrigger>
              <TabsTrigger value="APPLIED">
                Applied ({getApplicationsByStatus("APPLIED").length})
              </TabsTrigger>
              <TabsTrigger value="VIEWED">
                Viewed ({getApplicationsByStatus("VIEWED").length})
              </TabsTrigger>
              <TabsTrigger value="SHORTLISTED">
                Shortlisted ({getApplicationsByStatus("SHORTLISTED").length})
              </TabsTrigger>
              <TabsTrigger value="INTERVIEW">
                Interview ({getApplicationsByStatus("INTERVIEW").length})
              </TabsTrigger>
              <TabsTrigger value="OFFERED">
                Offered ({getApplicationsByStatus("OFFERED").length})
              </TabsTrigger>
              <TabsTrigger value="HIRED">
                Hired ({getApplicationsByStatus("HIRED").length})
              </TabsTrigger>
              <TabsTrigger value="REJECTED">
                Rejected ({getApplicationsByStatus("REJECTED").length})
              </TabsTrigger>
              <TabsTrigger value="WITHDRAWN">
                Withdrawn ({getApplicationsByStatus("WITHDRAWN").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard 
                    key={application.id} 
                    application={application} 
                    onUpdateStatus={updateApplicationStatus}
                    onOpenNotes={(appId, notes) => setNotesDialog({open: true, applicationId: appId, notes})}
                    updatingApplication={updatingApplication}
                  />
                ))}
              </div>
            </TabsContent>

            {["APPLIED", "VIEWED", "SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED", "REJECTED", "WITHDRAWN"].map((status) => (
              <TabsContent key={status} value={status} className="mt-6">
                <div className="space-y-4">
                  {getApplicationsByStatus(status).map((application) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application} 
                      onUpdateStatus={updateApplicationStatus}
                      onOpenNotes={(appId, notes) => setNotesDialog({open: true, applicationId: appId, notes})}
                      updatingApplication={updatingApplication}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Notes Dialog */}
        <Dialog open={notesDialog.open} onOpenChange={(open) => setNotesDialog({...notesDialog, open})}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Application Notes</DialogTitle>
              <DialogDescription>
                Add private notes about this application for your reference.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={notesDialog.notes}
              onChange={(e) => setNotesDialog({...notesDialog, notes: e.target.value})}
              placeholder="Enter your notes here..."
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setNotesDialog({open: false, applicationId: "", notes: ""})}>
                Cancel
              </Button>
              <Button onClick={updateApplicationNotes}>
                Save Notes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ApplicationCard({ 
  application, 
  onUpdateStatus, 
  onOpenNotes,
  updatingApplication 
}: { 
  application: Application;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenNotes: (id: string, notes: string) => void;
  updatingApplication: string | null;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-yellow-100 text-yellow-800";
      case "VIEWED":
        return "bg-blue-100 text-blue-800";
      case "SHORTLISTED":
        return "bg-green-100 text-green-800";
      case "INTERVIEW":
        return "bg-purple-100 text-purple-800";
      case "OFFERED":
        return "bg-indigo-100 text-indigo-800";
      case "HIRED":
        return "bg-emerald-100 text-emerald-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPLIED":
        return <Clock className="w-4 h-4" />;
      case "VIEWED":
        return <Eye className="w-4 h-4" />;
      case "SHORTLISTED":
        return <Star className="w-4 h-4" />;
      case "INTERVIEW":
        return <MessageSquare className="w-4 h-4" />;
      case "OFFERED":
        return <Briefcase className="w-4 h-4" />;
      case "HIRED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "WITHDRAWN":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const statusOptions = [
    { value: "APPLIED", label: "Applied", color: "bg-yellow-100 text-yellow-800" },
    { value: "VIEWED", label: "Viewed", color: "bg-blue-100 text-blue-800" },
    { value: "SHORTLISTED", label: "Shortlisted", color: "bg-green-100 text-green-800" },
    { value: "INTERVIEW", label: "Interview", color: "bg-purple-100 text-purple-800" },
    { value: "OFFERED", label: "Offered", color: "bg-indigo-100 text-indigo-800" },
    { value: "HIRED", label: "Hired", color: "bg-emerald-100 text-emerald-800" },
    { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
  ];

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
              <Badge variant="outline">{application.jobType}</Badge>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 gap-4 mb-3">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {application.applicant.name}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {application.applicant.email}
              </div>
              {application.applicant.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {application.applicant.phone}
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {application.applicant.location}
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied {new Date(application.appliedAt).toLocaleDateString()}
              </div>
              {application.viewedAt && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Viewed {new Date(application.viewedAt).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {application.jobSalary}
              </div>
            </div>

            {/* Skills */}
            {application.applicant.skills.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {application.applicant.skills.slice(0, 6).map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                  {application.applicant.skills.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{application.applicant.skills.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Cover Letter</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {application.coverLetter}
                </p>
              </div>
            )}

            {/* Notes */}
            {application.notes && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-700">Notes</span>
                </div>
                <p className="text-sm text-blue-600">
                  {application.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {/* CV Download */}
            {application.applicant.cvUrl && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                CV
              </Button>
            )}
            
            {/* View Job */}
            <Link href={`/jobs/${application.jobId}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Job
              </Button>
            </Link>

            {/* Notes */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenNotes(application.id, application.notes || "")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Notes
            </Button>
          </div>
        </div>

        {/* Status Update Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Update Status:</span>
            <div className="flex gap-1">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={application.status === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(application.id, option.value)}
                  disabled={updatingApplication === application.id}
                  className={application.status === option.value ? option.color : ""}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          {updatingApplication === application.id && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="w-4 h-4 animate-spin" />
              Updating...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}