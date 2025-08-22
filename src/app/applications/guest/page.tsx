"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Clock,
  Building2,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Hourglass,
  Search,
  User
} from "lucide-react";
import Link from "next/link";

interface GuestApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string | null;
  industry: string;
  location: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  status: "APPLIED" | "VIEWED" | "SHORTLISTED" | "REJECTED" | "HIRED";
  appliedAt: string;
  viewedAt: string | null;
  respondedAt: string | null;
  coverLetter: string | null;
  cvUrl: string | null;
}

export default function GuestApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [applications, setApplications] = useState<GuestApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [showApplications, setShowApplications] = useState(false);

  // If user is authenticated, redirect to regular applications page
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/applications");
    }
  }, [status, router]);

  const handleTrackApplications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setLoading(true);
    setError("");
    setEmail(searchEmail.trim());

    try {
      const response = await fetch(`/api/applications/guest?email=${encodeURIComponent(searchEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setShowApplications(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to fetch applications");
      }
    } catch (err) {
      setError("An error occurred while fetching your applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "VIEWED":
        return "bg-yellow-100 text-yellow-800";
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
      case "APPLIED":
        return <Clock className="w-4 h-4" />;
      case "VIEWED":
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null; // Will redirect to /applications
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Track Your Applications</h1>
              <p className="text-gray-600 mt-1">
                Check the status of your job applications as a guest user
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/jobs">
                <Button variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button>
                  <User className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!showApplications ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Your Applications
                </CardTitle>
                <CardDescription>
                  Enter the email address you used when applying for jobs to track your application status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrackApplications} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading || !searchEmail.trim()}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Track Applications
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Benefits of Creating an Account</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Track all your applications in one place</li>
                    <li>• Save jobs and apply with one click</li>
                    <li>• Get personalized job recommendations</li>
                    <li>• Set up job alerts for new opportunities</li>
                    <li>• Manage your profile and CV</li>
                  </ul>
                  <div className="mt-3">
                    <Link href="/auth/signup">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Create Free Account
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Applications for {email}
                  </h2>
                  <p className="text-gray-600">
                    {applications.length} application{applications.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplications(false);
                    setSearchEmail("");
                    setApplications([]);
                  }}
                >
                  Search Different Email
                </Button>
              </div>

              {/* Applications List */}
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {application.companyLogo ? (
                              <img
                                src={application.companyLogo}
                                alt={application.companyName}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-xl">{application.jobTitle}</CardTitle>
                              <CardDescription className="text-lg font-medium text-blue-600">
                                {application.companyName}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(application.status)}
                              {application.status}
                            </div>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {application.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {application.type}
                            </div>
                            {application.salaryMin && application.salaryMax && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  €{application.salaryMin.toLocaleString()} - €{application.salaryMax.toLocaleString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Applied {formatDate(application.appliedAt)}
                            </div>
                          </div>

                          {application.coverLetter && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Cover Letter:
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}

                          {application.cvUrl && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">CV attached</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(application.cvUrl, "_blank")}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-xs text-gray-500">
                              {application.viewedAt && (
                                <span>Viewed by employer on {formatDate(application.viewedAt)}</span>
                              )}
                              {application.respondedAt && (
                                <span className="ml-4">
                                  Responded on {formatDate(application.respondedAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/jobs/${application.id.replace('app_', '')}`}>
                                <Button size="sm" variant="outline">
                                  View Job
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Applications Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      We couldn't find any applications associated with this email address.
                    </p>
                    <div className="space-y-3">
                      <Link href="/jobs">
                        <Button>Browse Jobs</Button>
                      </Link>
                      <p className="text-sm text-gray-500">
                        Make sure you're using the same email address you used when applying.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Create Account CTA */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Get More Features with an Account
                    </h3>
                    <p className="text-blue-800 mb-4">
                      Create a free account to save jobs, get recommendations, and manage applications more easily.
                    </p>
                    <Link href="/auth/signup">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Create Your Free Account
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}