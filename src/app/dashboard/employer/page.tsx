"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building, 
  Users, 
  Briefcase, 
  Eye, 
  Edit, 
  Save, 
  X, 
  Plus,
  TrendingUp,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Settings,
  LogOut,
  FileText,
  Download,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import CitySelector from "@/components/ui/CitySelector";
import { CyprusCity } from "@/lib/constants/cities";

interface EmployerProfile {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  industry?: string;
  description?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  size?: string;
  logo?: string;
}

interface Company {
  id: string;
  description?: string;
  mission?: string;
  values?: string;
  benefits?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
  totalApplications: number;
  recentApplications: number;
  featuredJobs: number;
}

interface RecentJob {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
  applicationsCount: number;
  views: number;
}

interface RecentApplication {
  id: string;
  jobTitle: string;
  applicantName: string;
  status: string;
  appliedAt: string;
  hasCV: boolean;
}

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    industry: "",
    description: "",
    address: "",
    city: "" as CyprusCity | "",
    postalCode: "",
    size: "",
  });

  const [companyData, setCompanyData] = useState({
    description: "",
    mission: "",
    values: "",
    benefits: "",
    linkedin: "",
    facebook: "",
    twitter: "",
    instagram: "",
  });

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
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, companyRes, statsRes, jobsRes, applicationsRes] = await Promise.all([
        fetch("/api/employer/profile"),
        fetch("/api/employer/company"),
        fetch("/api/employer/stats"),
        fetch("/api/employer/jobs/recent"),
        fetch("/api/employer/applications/recent"),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setFormData({
          companyName: profileData.companyName,
          contactName: profileData.contactName,
          contactEmail: profileData.contactEmail,
          contactPhone: profileData.contactPhone || "",
          website: profileData.website || "",
          industry: profileData.industry || "",
          description: profileData.description || "",
          address: profileData.address || "",
          city: profileData.city || "",
          postalCode: profileData.postalCode || "",
          size: profileData.size || "",
        });
      }

      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompany(companyData);
        setCompanyData({
          description: companyData.description || "",
          mission: companyData.mission || "",
          values: companyData.values || "",
          benefits: companyData.benefits || "",
          linkedin: companyData.linkedin || "",
          facebook: companyData.facebook || "",
          twitter: companyData.twitter || "",
          instagram: companyData.instagram || "",
        });
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setRecentJobs(jobsData.jobs);
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setRecentApplications(applicationsData.applications);
      }
    } catch (error) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/employer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Profile updated successfully");
        setEditing(false);
        fetchDashboardData();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/employer/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      });

      if (response.ok) {
        setSuccess("Company information updated successfully");
        fetchDashboardData();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update company information");
      }
    } catch (error) {
      setError("An error occurred while updating company information");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "CLOSED":
        return "bg-yellow-100 text-yellow-800";
      case "PAUSED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "VIEWED":
        return "bg-purple-100 text-purple-800";
      case "SHORTLISTED":
        return "bg-green-100 text-green-800";
      case "INTERVIEW":
        return "bg-yellow-100 text-yellow-800";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
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
            <Button className="w-full mt-4" onClick={() => router.push("/")}>
              Go Home
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
                <Link href="/jobs/manage" className="text-gray-600 hover:text-blue-600">
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
                Welcome, {profile?.contactName || session?.user?.email}
              </span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{profile?.companyName}</CardTitle>
                    <CardDescription className="text-sm">Employer Account</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("overview")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Company Profile
                </Button>
                <Button
                  variant={activeTab === "jobs" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("jobs")}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Job Postings
                </Button>
                <Button
                  variant={activeTab === "applications" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("applications")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Applications
                </Button>
                <Button
                  variant={activeTab === "billing" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("billing")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {stats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Jobs</span>
                    <Badge variant="secondary">{stats.activeJobs}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Applications</span>
                    <Badge variant="secondary">{stats.totalApplications}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recent Views</span>
                    <Badge variant="secondary">{Math.floor(Math.random() * 1000) + 100}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to Your Dashboard</CardTitle>
                    <CardDescription>
                      Manage your job postings, view applications, and track your hiring progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button className="h-20 flex-col">
                        <Plus className="w-6 h-6 mb-2" />
                        Post a Job
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <Briefcase className="w-6 h-6 mb-2" />
                        Manage Jobs
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <Users className="w-6 h-6 mb-2" />
                        View Applications
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <CreditCard className="w-6 h-6 mb-2" />
                        Billing
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Overview */}
                {stats && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalJobs}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.activeJobs} active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Applications</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.recentApplications} this week
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Featured Jobs</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.featuredJobs}</div>
                        <p className="text-xs text-muted-foreground">
                          Increased visibility
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expired Jobs</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.expiredJobs}</div>
                        <p className="text-xs text-muted-foreground">
                          Need renewal
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Recent Jobs */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Recent Job Postings</CardTitle>
                        <CardDescription>Your latest job postings</CardDescription>
                      </div>
                      <Link href="/jobs/manage">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentJobs.length > 0 ? (
                      <div className="space-y-4">
                        {recentJobs.map((job) => (
                          <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-medium">{job.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {job.location}
                                </span>
                                <span className="flex items-center">
                                  <Briefcase className="w-4 h-4 mr-1" />
                                  {job.type.replace("_", " ")}
                                </span>
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {job.views} views
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                              <div className="text-right">
                                <div className="text-sm font-medium">{job.applicationsCount}</div>
                                <div className="text-xs text-gray-600">applications</div>
                              </div>
                              <Link href={`/jobs/${job.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No job postings yet</p>
                        <Link href="/jobs/post">
                          <Button className="mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Post Your First Job
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Recent Applications</CardTitle>
                        <CardDescription>Latest applications to your job postings</CardDescription>
                      </div>
                      <Link href="/applications">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentApplications.length > 0 ? (
                      <div className="space-y-4">
                        {recentApplications.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-medium">{application.applicantName}</h3>
                              <p className="text-sm text-gray-600 mt-1">{application.jobTitle}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(application.appliedAt)}
                                </span>
                                {application.hasCV && (
                                  <span className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    CV attached
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getApplicationStatusColor(application.status)}>
                                {application.status}
                              </Badge>
                              <Link href={`/applications/${application.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No applications yet</p>
                        <p className="text-sm">Post jobs to start receiving applications</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="company">Company Information</TabsTrigger>
                  <TabsTrigger value="details">Company Details</TabsTrigger>
                </TabsList>

                <TabsContent value="company">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Company Information</CardTitle>
                          <CardDescription>
                            Manage your company profile and contact information
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(!editing)}
                        >
                          {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="industry">Industry *</Label>
                          <Select
                            value={formData.industry}
                            onValueChange={(value) => setFormData({ ...formData, industry: value })}
                            disabled={!editing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="hospitality">Hospitality</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="consulting">Consulting</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="contactName">Contact Person *</Label>
                          <Input
                            id="contactName"
                            value={formData.contactName}
                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactEmail">Contact Email *</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPhone">Contact Phone</Label>
                          <Input
                            id="contactPhone"
                            placeholder="+357 99 123456"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            placeholder="https://company.com"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Tell us about your company..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          disabled={!editing}
                          rows={4}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            placeholder="Street address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <CitySelector
                            value={formData.city}
                            onValueChange={(value) => setFormData({ ...formData, city: value })}
                            placeholder="Select city..."
                            showPopular={true}
                            showDistricts={true}
                            disabled={!editing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            placeholder="1234"
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            disabled={!editing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="size">Company Size</Label>
                        <Select
                          value={formData.size}
                          onValueChange={(value) => setFormData({ ...formData, size: value })}
                          disabled={!editing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STARTUP">Startup (1-10 employees)</SelectItem>
                            <SelectItem value="SMALL">Small (11-50 employees)</SelectItem>
                            <SelectItem value="MEDIUM">Medium (51-200 employees)</SelectItem>
                            <SelectItem value="LARGE">Large (201-1000 employees)</SelectItem>
                            <SelectItem value="ENTERPRISE">Enterprise (1000+ employees)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {editing && (
                        <div className="flex gap-4">
                          <Button onClick={handleSaveProfile} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button variant="outline" onClick={() => setEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Details</CardTitle>
                      <CardDescription>
                        Additional information about your company culture and values
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="companyDescription">Company Description</Label>
                        <Textarea
                          id="companyDescription"
                          placeholder="Detailed description of your company..."
                          value={companyData.description}
                          onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="mission">Mission Statement</Label>
                        <Textarea
                          id="mission"
                          placeholder="Your company's mission and vision..."
                          value={companyData.mission}
                          onChange={(e) => setCompanyData({ ...companyData, mission: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="values">Company Values</Label>
                        <Textarea
                          id="values"
                          placeholder="Core values that drive your company culture..."
                          value={companyData.values}
                          onChange={(e) => setCompanyData({ ...companyData, values: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="benefits">Benefits & Perks</Label>
                        <Textarea
                          id="benefits"
                          placeholder="Benefits and perks you offer to employees..."
                          value={companyData.benefits}
                          onChange={(e) => setCompanyData({ ...companyData, benefits: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            placeholder="https://linkedin.com/company/yourcompany"
                            value={companyData.linkedin}
                            onChange={(e) => setCompanyData({ ...companyData, linkedin: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            placeholder="https://facebook.com/yourcompany"
                            value={companyData.facebook}
                            onChange={(e) => setCompanyData({ ...companyData, facebook: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="twitter">Twitter</Label>
                          <Input
                            id="twitter"
                            placeholder="https://twitter.com/yourcompany"
                            value={companyData.twitter}
                            onChange={(e) => setCompanyData({ ...companyData, twitter: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            placeholder="https://instagram.com/yourcompany"
                            value={companyData.instagram}
                            onChange={(e) => setCompanyData({ ...companyData, instagram: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button onClick={handleSaveCompany} disabled={saving}>
                          {saving ? "Saving..." : "Save Company Details"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Jobs Tab */}
            {activeTab === "jobs" && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Job Postings</CardTitle>
                      <CardDescription>
                        Manage your job postings and track their performance
                      </CardDescription>
                    </div>
                    <Link href="/jobs/post">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Post New Job
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentJobs.length > 0 ? (
                    <div className="space-y-4">
                      {recentJobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <h3 className="font-medium">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-1" />
                                {job.type.replace("_", " ")}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(job.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm font-medium">{job.applicationsCount}</div>
                              <div className="text-xs text-gray-600">applications</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{job.views}</div>
                              <div className="text-xs text-gray-600">views</div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/jobs/${job.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Link href={`/jobs/${job.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-4">
                        <Link href="/jobs/manage">
                          <Button variant="outline">
                            View All Job Postings
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No Job Postings Yet</h3>
                      <p className="text-gray-600 mb-6">
                        Start posting jobs to attract top talent in Cyprus
                      </p>
                      <Link href="/jobs/post">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Applications Tab */}
            {activeTab === "applications" && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Applications</CardTitle>
                      <CardDescription>
                        Review and manage applications to your job postings
                      </CardDescription>
                    </div>
                    <Link href="/applications">
                      <Button variant="outline">
                        View All Applications
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((application) => (
                        <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <h3 className="font-medium">{application.applicantName}</h3>
                            <p className="text-sm text-gray-600 mt-1">{application.jobTitle}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(application.appliedAt)}
                              </span>
                              {application.hasCV && (
                                <span className="flex items-center">
                                  <FileText className="w-3 h-3 mr-1" />
                                  CV attached
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getApplicationStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                            <Link href={`/applications/${application.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                                <ExternalLink className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-4">
                        <Link href="/applications">
                          <Button variant="outline">
                            View All Applications
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                      <p className="text-gray-600 mb-6">
                        Applications will appear here once candidates start applying to your jobs
                      </p>
                      <Link href="/jobs/post">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Post a Job
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Overview</CardTitle>
                    <CardDescription>
                      Manage your subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-6">
                        <h3 className="font-medium mb-2">Current Plan</h3>
                        <div className="text-2xl font-bold text-blue-600 mb-2">Basic Plan</div>
                        <p className="text-sm text-gray-600 mb-4">€50/month</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            5 job postings per month
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Basic applicant tracking
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Email support
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Upgrade Plan
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-6">
                        <h3 className="font-medium mb-2">Usage This Month</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Job Postings</span>
                              <span>3/5</span>
                            </div>
                            <Progress value={60} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Applications Received</span>
                              <span>12</span>
                            </div>
                            <Progress value={40} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Featured Jobs</span>
                              <span>1/2</span>
                            </div>
                            <Progress value={50} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                      Manage your payment methods and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <div className="font-medium">Visa ending in 4242</div>
                            <div className="text-sm text-gray-600">Expires 12/2025</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>
                      View your payment history and download invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Basic Plan - Monthly</div>
                          <div className="text-sm text-gray-600">March 1, 2024</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">€50.00</div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Basic Plan - Monthly</div>
                          <div className="text-sm text-gray-600">February 1, 2024</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">€50.00</div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}