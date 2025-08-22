"use client";

import { useState, useEffect } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Briefcase, 
  Heart, 
  Bell, 
  Settings, 
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Zap,
  Award,
  FileText,
  Plus,
  ChevronRight,
  Brain
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import JobRecommendations from "@/components/dashboard/JobRecommendations";

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    location: string;
    type: string;
    employer: {
      companyName: string;
    };
  };
  status: "APPLIED" | "VIEWED" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED" | "WITHDRAWN";
  appliedAt: string;
  updatedAt: string;
}

interface SavedJob {
  id: string;
  job: {
    id: string;
    title: string;
    location: string;
    type: string;
    salaryMin?: number;
    salaryMax?: number;
    employer: {
      companyName: string;
    };
  };
  createdAt: string;
}

interface JobAlert {
  id: string;
  title: string;
  location?: string;
  industry?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  frequency: "INSTANT" | "DAILY" | "WEEKLY";
  active: boolean;
  createdAt: string;
}

interface ProfileStats {
  profileStrength: number;
  activeApplications: number;
  savedJobs: number;
  profileViews: number;
  recommendedJobs: number;
}

export default function JobSeekerDashboard() {
  const { user, loading: authLoading } = useSupabaseUser();
  const router = useRouter();
  const t = useTranslations('dashboard.jobSeeker');
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    profileStrength: 0,
    activeApplications: 0,
    savedJobs: 0,
    profileViews: 0,
    recommendedJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "JOB_SEEKER") {
      router.push("/dashboard/employer");
      return;
    }

    fetchDashboardData();
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [applicationsRes, savedJobsRes, jobAlertsRes, statsRes] = await Promise.all([
        fetch('/api/job-seeker/applications'),
        fetch('/api/job-seeker/saved-jobs'),
        fetch('/api/job-seeker/job-alerts'),
        fetch('/api/job-seeker/stats')
      ]);

      if (applicationsRes.ok) {
        const appsData = await applicationsRes.json();
        setApplications(appsData.applications || []);
      }

      if (savedJobsRes.ok) {
        const savedData = await savedJobsRes.json();
        setSavedJobs(savedData.savedJobs || []);
      }

      if (jobAlertsRes.ok) {
        const alertsData = await jobAlertsRes.json();
        setJobAlerts(alertsData.jobAlerts || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'VIEWED': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'SHORTLISTED': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'INTERVIEW': return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'OFFERED': return <Award className="w-4 h-4 text-green-500" />;
      case 'HIRED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WITHDRAWN': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VIEWED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SHORTLISTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INTERVIEW': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'OFFERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'HIRED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const getProfileStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600';
    if (strength >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfileStrengthLabel = (strength: number) => {
    if (strength >= 80) return 'Excellent';
    if (strength >= 60) return 'Good';
    if (strength >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('welcome')}, {(user as any)?.name || (user as any)?.email || 'Job Seeker'}!
              </h1>
              <p className="text-gray-600 mt-1">
                {t('completeProfile')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/job-seeker/profile">
                  <User className="w-4 h-4 mr-2" />
                  {t('profile')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/jobs">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">{t('profileStrength')}</p>
                  <p className={`text-2xl font-bold ${getProfileStrengthColor(stats.profileStrength)}`}>
                    {stats.profileStrength}%
                  </p>
                  <p className="text-xs text-blue-100 mt-1">
                    {getProfileStrengthLabel(stats.profileStrength)}
                  </p>
                </div>
                <User className="w-12 h-12 text-blue-200" />
              </div>
              <Progress value={stats.profileStrength} className="mt-4 bg-blue-400" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">{t('activeApplications')}</p>
                  <p className="text-2xl font-bold">{stats.activeApplications}</p>
                </div>
                <Briefcase className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">{t('savedJobsCount')}</p>
                  <p className="text-2xl font-bold">{stats.savedJobs}</p>
                </div>
                <Heart className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">{t('profileViews')}</p>
                  <p className="text-2xl font-bold">{stats.profileViews}</p>
                </div>
                <Eye className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">{t('recommendedJobs')}</p>
                  <p className="text-2xl font-bold">{stats.recommendedJobs}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="applications" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="applications" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t('applications')}
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {t('savedJobs')}
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {t('alerts')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/applications">View All</Link>
                  </Button>
                </div>
                
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application) => (
                      <Card key={application.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(application.status)}
                                <h3 className="font-semibold text-gray-900">{application.job.title}</h3>
                                <Badge className={getStatusColor(application.status)}>
                                  {application.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  {application.job.employer.companyName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {application.job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {application.job.type.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Applied {formatDate(application.appliedAt)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/applications/${application.id}`}>
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600 mb-6">Start applying for jobs to track your applications here.</p>
                      <Button asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Saved Jobs</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/saved-jobs">View All</Link>
                  </Button>
                </div>
                
                {savedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {savedJobs.slice(0, 5).map((savedJob) => (
                      <Card key={savedJob.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2">{savedJob.job.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  {savedJob.job.employer.companyName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {savedJob.job.location}
                                </span>
                                {savedJob.job.salaryMin && (
                                  <span className="flex items-center gap-1 text-green-600 font-medium">
                                    €{savedJob.job.salaryMin.toLocaleString()}
                                    {savedJob.job.salaryMax && ` - €${savedJob.job.salaryMax.toLocaleString()}`}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Saved {formatDate(savedJob.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/jobs/${savedJob.job.id}`}>View</Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/jobs/${savedJob.job.id}/apply`}>Apply</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved jobs</h3>
                      <p className="text-gray-600 mb-6">Save jobs you're interested in to find them here later.</p>
                      <Button asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Job Alerts</h2>
                  <Button size="sm" asChild>
                    <Link href="/job-alerts">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Alert
                    </Link>
                  </Button>
                </div>
                
                {jobAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {jobAlerts.map((alert) => (
                      <Card key={alert.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                                <Badge variant={alert.active ? "default" : "secondary"}>
                                  {alert.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {alert.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {alert.location}
                                  </span>
                                )}
                                {alert.industry && (
                                  <span className="flex items-center gap-1">
                                    <Building className="w-4 h-4" />
                                    {alert.industry}
                                  </span>
                                )}
                                {alert.jobType && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" />
                                    {alert.jobType.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Frequency: {alert.frequency.toLowerCase()} • Created {formatDate(alert.createdAt)}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/job-alerts/${alert.id}`}>
                                <Settings className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No job alerts</h3>
                      <p className="text-gray-600 mb-6">Create job alerts to get notified about new opportunities.</p>
                      <Button asChild>
                        <Link href="/job-alerts">Create Alert</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/jobs">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/job-seeker/profile">
                    <User className="w-4 h-4 mr-2" />
                    Update Profile
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/job-alerts">
                    <Bell className="w-4 h-4 mr-2" />
                    Manage Alerts
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/gdpr">
                    <Settings className="w-4 h-4 mr-2" />
                    GDPR Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            {stats.profileStrength < 100 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    Complete Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    A complete profile helps you get better job recommendations and increases your chances of getting hired.
                  </p>
                  <Progress value={stats.profileStrength} className="mb-4" />
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/dashboard/job-seeker/profile">
                      Complete Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* AI Job Recommendations */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    AI Job Recommendations
                  </CardTitle>
                  <CardDescription>
                    Personalized job recommendations powered by AI
                  </CardDescription>
                </CardHeader>
              </Card>
              <JobRecommendations limit={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}