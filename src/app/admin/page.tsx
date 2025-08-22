"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CreditCard, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import RealTimeAnalytics from "@/components/admin/RealTimeAnalytics";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
  company: {
    name: string;
  };
}

interface GDPRRequest {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
  processedAt: string;
}

interface ComplianceMetrics {
  totalUsers: number;
  activeUsers: number;
  gdprRequests: number;
  pendingDeletions: number;
  dataRetentionDays: number;
  lastAuditDate: string;
}

interface AnalyticsData {
  users: {
    total: number;
    newLast30Days: number;
    newLast7Days: number;
    activeLast30Days: number;
    growthRate: string;
    byRole: Array<{ role: string; _count: { role: number } }>;
  };
  jobs: {
    total: number;
    active: number;
    newLast30Days: number;
    newLast7Days: number;
    growthRate: string;
    byStatus: Array<{ status: string; _count: { status: number } }>;
    byType: Array<{ type: string; _count: { type: number } }>;
    topLocations: Array<{ location: string; _count: { location: number } }>;
    featured: number;
    urgent: number;
    fillRate: string;
  };
  applications: {
    total: number;
    newLast30Days: number;
    newLast7Days: number;
    growthRate: string;
    byStatus: Array<{ status: string; _count: { status: number } }>;
    byDay: Array<{ date: string; count: number }>;
    conversionRate: string;
    averagePerJob: string;
  };
  employers: {
    total: number;
    active: number;
    newLast30Days: number;
    growthRate: string;
    bySize: Array<{ size: string; _count: { size: number } }>;
    topByJobCount: Array<{ companyName: string; jobCount: number }>;
  };
  revenue: {
    total: number;
    last30Days: number;
    last7Days: number;
    byStatus: Array<{ status: string; _sum: { amount: number }; _count: { status: number } }>;
    byType: Array<{ type: string; _sum: { amount: number }; _count: { type: number } }>;
    byMonth: Array<{ month: string; revenue: number; count: number }>;
    averageOrderValue: string;
  };
  performance: {
    averageResponseTime: number;
    gdprRequestsProcessed: number;
    systemHealth: {
      uptime: string;
      responseTime: string;
      errorRate: string;
    };
    uptime: string;
  };
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [gdprRequests, setGdprRequests] = useState<GDPRRequest[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsSubTab, setAnalyticsSubTab] = useState("charts");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchAdminData();
  }, [session, status, router]);

  useEffect(() => {
    if (activeTab === "analytics" && !analytics) {
      fetchAnalyticsData();
    }
  }, [activeTab, analytics]);

  const fetchAdminData = async () => {
    try {
      const [usersRes, paymentsRes, gdprRes, metricsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/payments'),
        fetch('/api/admin/gdpr-requests'),
        fetch('/api/admin/metrics')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.payments || []);
      }

      if (gdprRes.ok) {
        const gdprData = await gdprRes.json();
        setGdprRequests(gdprData.requests || []);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const analyticsRes = await fetch('/api/admin/analytics/enhanced');
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error handling user action:', error);
    }
  };

  const handleGDPRRequest = async (requestId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/gdpr-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error handling GDPR request:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-500">Suspended</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage users, payments, and GDPR compliance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.activeUsers} active users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GDPR Requests</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.gdprRequests}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.pendingDeletions} pending deletions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Data Retention</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.dataRetentionDays}</div>
                    <p className="text-xs text-muted-foreground">
                      days retention period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {format(new Date(metrics.lastAuditDate), 'MMM dd')}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Compliance check completed
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent GDPR Requests</CardTitle>
                  <CardDescription>Latest data access and deletion requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gdprRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{request.user.name}</p>
                            <p className="text-xs text-muted-foreground">{request.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.status)}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest subscription payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{payment.user.name}</p>
                            <p className="text-xs text-muted-foreground">{payment.company.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {payment.amount} {payment.currency}
                          </span>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Tabs value={analyticsSubTab} onValueChange={setAnalyticsSubTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="charts">Charts & Metrics</TabsTrigger>
                <TabsTrigger value="realtime">Real-Time</TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-6">
                {analytics ? (
                  <AnalyticsCharts 
                    data={analytics} 
                    onRefresh={fetchAnalyticsData}
                    loading={analyticsLoading}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading analytics data...</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="realtime" className="space-y-6">
                <RealTimeAnalytics />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all registered users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.status === 'ACTIVE' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'suspend')}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>Monitor and manage all payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.user.name}
                          <div className="text-sm text-muted-foreground">
                            {payment.user.email}
                          </div>
                        </TableCell>
                        <TableCell>{payment.company.name}</TableCell>
                        <TableCell className="font-medium">
                          {payment.amount} {payment.currency}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GDPR Tab */}
          <TabsContent value="gdpr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GDPR Compliance</CardTitle>
                <CardDescription>Manage data access and deletion requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gdprRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.user.name}
                          <div className="text-sm text-muted-foreground">
                            {request.user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {request.processedAt
                            ? format(new Date(request.processedAt), 'MMM dd, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGDPRRequest(request.id, 'approve')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGDPRRequest(request.id, 'reject')}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Settings</CardTitle>
                <CardDescription>Configure GDPR compliance parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retention">Data Retention Period (days)</Label>
                    <Input id="retention" defaultValue="730" />
                  </div>
                  <div>
                    <Label htmlFor="audit">Audit Frequency (days)</Label>
                    <Input id="audit" defaultValue="30" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button>Save Settings</Button>
                  <Button variant="outline">Run Audit Now</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}