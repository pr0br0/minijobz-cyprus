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
  Building, 
  Briefcase, 
  Users, 
  FileText, 
  CreditCard, 
  Settings,
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Zap,
  Award,
  Plus,
  ChevronRight,
  DollarSign,
  UserCheck,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  status: "DRAFT" | "PUBLISHED" | "EXPIRED" | "CLOSED" | "PAUSED";
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  expiresAt?: string;
  _count: {
    applications: number;
  };
}

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
  };
  jobSeeker: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    experience?: number;
  };
  status: "APPLIED" | "VIEWED" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED" | "WITHDRAWN";
  appliedAt: string;
  viewedAt?: string;
  coverLetter?: string;
}

interface CompanyStats {
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlistedCandidates: number;
  totalViews: number;
  averageResponseTime: number;
}

interface Subscription {
  id: string;
  plan: "BASIC" | "PREMIUM";
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PENDING";
  startsAt: string;
  endsAt: string;
  cancelledAt?: string;
}

export default function EmployerDashboard() {
  const { user, loading: authLoading } = useSupabaseUser();
  const router = useRouter();
  const t = useTranslations('dashboard.employer');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<CompanyStats>({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    shortlistedCandidates: 0,
    totalViews: 0,
    averageResponseTime: 0
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (user.role !== "EMPLOYER") {
      router.push("/dashboard/job-seeker");
      return;
    }

    fetchDashboardData();
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [jobsRes, applicationsRes, statsRes, subscriptionRes] = await Promise.all([
        fetch('/api/employer/jobs/recent'),
        fetch('/api/employer/applications/recent'),
        fetch('/api/employer/stats'),
        fetch('/api/employer/subscription')
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      }

      if (applicationsRes.ok) {
        const appsData = await applicationsRes.json();
        setApplications(appsData.applications || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (subscriptionRes.ok) {
        const subData = await subscriptionRes.json();
        setSubscription(subData.subscription);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'DRAFT': return <FileText className="w-4 h-4 text-gray-500" />;
      case 'EXPIRED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'CLOSED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PAUSED': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CLOSED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PAUSED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApplicationStatusIcon = (status: string) => {
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

  const getApplicationStatusColor = (status: string) => {
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

  const getSubscriptionStatus = () => {
    if (!subscription) return 'No Active Plan';
    if (subscription.status === 'ACTIVE') return `${subscription.plan} Plan`;
    if (subscription.status === 'CANCELLED') return 'Cancelled';
    if (subscription.status === 'EXPIRED') return 'Expired';
    return 'Pending';
  };

  const getSubscriptionColor = () => {
    if (!subscription) return 'text-gray-600';
    if (subscription.status === 'ACTIVE') return 'text-green-600';
    if (subscription.status === 'CANCELLED') return 'text-orange-600';
    if (subscription.status === 'EXPIRED') return 'text-red-600';
    return 'text-yellow-600';
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
                {t('welcome')}, {(user as any)?.name || (user as any)?.email || 'Employer'}!
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">
                  Manage your job postings and track applications
                </p>
                <Badge variant="outline" className={getSubscriptionColor()}>
                  {getSubscriptionStatus()}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/jobs/post">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('postNewJob')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/employer/profile">
                  <Building className="w-4 h-4 mr-2" />
                  Company Profile
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
                  <p className="text-blue-100 text-sm">{t('activeJobs')}</p>
                  <p className="text-2xl font-bold">{stats.activeJobs}</p>
                </div>
                <Briefcase className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">{t('totalApplications')}</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <FileText className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">{t('newApplications')}</p>
                  <p className="text-2xl font-bold">{stats.newApplications}</p>
                </div>
                <Users className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">{t('shortlistedCandidates')}</p>
                  <p className="text-2xl font-bold">{stats.shortlistedCandidates}</p>
                </div>
                <UserCheck className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Profile Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
                <Eye className="w-12 h-12 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="jobs" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t('jobs')}
                </TabsTrigger>
                <TabsTrigger value="applications" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('applications')}
                </TabsTrigger>
                <TabsTrigger value="candidates" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  {t('candidates')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Job Postings</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/employer/jobs">View All</Link>
                  </Button>
                </div>
                
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getJobStatusIcon(job.status)}
                                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                <Badge className={getJobStatusColor(job.status)}>
                                  {job.status}
                                </Badge>
                                {job.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                                {job.urgent && <Badge className="bg-red-500">Urgent</Badge>}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {job.type.replace('_', ' ')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {job._count.applications} applications
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Posted {formatDate(job.createdAt)}
                                </span>
                                {job.expiresAt && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Expires {formatDate(job.expiresAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/jobs/${job.id}`}>View</Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/jobs/${job.id}/applications`}>
                                  <Users className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/jobs/${job.id}/edit`}>
                                  <Settings className="w-4 h-4" />
                                </Link>
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
                      <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No job postings yet</h3>
                      <p className="text-gray-600 mb-6">Start by posting your first job to reach qualified candidates.</p>
                      <Button asChild>
                        <Link href="/jobs/post">
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/employer/applications">View All</Link>
                  </Button>
                </div>
                
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getApplicationStatusIcon(application.status)}
                                <h3 className="font-semibold text-gray-900">
                                  {application.jobSeeker.firstName} {application.jobSeeker.lastName}
                                </h3>
                                <Badge className={getApplicationStatusColor(application.status)}>
                                  {application.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {application.job.title}
                                </span>
                                {application.jobSeeker.title && (
                                  <span className="flex items-center gap-1">
                                    <UserCheck className="w-4 h-4" />
                                    {application.jobSeeker.title}
                                  </span>
                                )}
                                {application.jobSeeker.experience && (
                                  <span className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    {application.jobSeeker.experience} years experience
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Applied {formatDate(application.appliedAt)}
                                </span>
                                {application.viewedAt && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    Viewed {formatDate(application.viewedAt)}
                                  </span>
                                )}
                              </div>
                              {application.coverLetter && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {application.coverLetter}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/applications/${application.id}`}>View Profile</Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/applications/${application.id}/manage`}>
                                  <Settings className="w-4 h-4" />
                                </Link>
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
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600 mb-6">Applications will appear here once candidates start applying to your jobs.</p>
                      <Button asChild>
                        <Link href="/jobs/post">
                          <Plus className="w-4 h-4 mr-2" />
                          Post a Job
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="candidates" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Shortlisted Candidates</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/employer/candidates">View All</Link>
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No shortlisted candidates</h3>
                    <p className="text-gray-600 mb-6">
                      Shortlist promising candidates from your applications to find them here.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/employer/applications">Review Applications</Link>
                    </Button>
                  </CardContent>
                </Card>
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
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/jobs/post">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('postNewJob')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/employer/jobs">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Manage Jobs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/employer/applications">
                    <Users className="w-4 h-4 mr-2" />
                    View Applications
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/billing">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('billing')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/employer/profile">
                    <Building className="w-4 h-4 mr-2" />
                    Company Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Plan</span>
                    <Badge variant="outline" className={getSubscriptionColor()}>
                      {getSubscriptionStatus()}
                    </Badge>
                  </div>
                  {subscription && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Period</span>
                        <span className="text-sm text-gray-900">
                          {new Date(subscription.startsAt).toLocaleDateString()} - {new Date(subscription.endsAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                      </div>
                    </>
                  )}
                  <div className="pt-3 border-t">
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/billing">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Application Rate</span>
                      <span className="text-sm font-medium">
                        {stats.activeJobs > 0 ? Math.round(stats.totalApplications / stats.activeJobs) : 0} apps/job
                      </span>
                    </div>
                    <Progress value={Math.min((stats.totalApplications / stats.activeJobs) * 10, 100)} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="text-sm font-medium">
                        {stats.totalApplications > 0 ? Math.round((stats.totalApplications - stats.newApplications) / stats.totalApplications * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.totalApplications > 0 ? ((stats.totalApplications - stats.newApplications) / stats.totalApplications) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>

                  <div className="pt-3 border-t">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/dashboard/employer/analytics">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Prompt */}
            {(!subscription || subscription.plan === 'BASIC') && (
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    Upgrade to Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-100 mb-4">
                    Get unlimited job postings, featured listings, and advanced analytics.
                  </p>
                  <Button size="sm" className="w-full bg-white text-purple-600 hover:bg-gray-100" asChild>
                    <Link href="/billing">Upgrade Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}