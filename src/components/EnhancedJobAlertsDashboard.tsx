"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Mail,
  Smartphone,
  Search,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

interface JobAlert {
  id: string;
  title: string;
  keywords: string[];
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  frequency: "DAILY" | "WEEKLY" | "INSTANT";
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  totalJobsFound?: number;
  recentMatches?: number;
}

interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  totalMatches: number;
  recentNotifications: number;
}

export default function EnhancedJobAlertsDashboard() {
  const { data: session } = useSession();
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats>({
    totalAlerts: 0,
    activeAlerts: 0,
    totalMatches: 0,
    recentNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);

  // Real-time notifications
  const {
    isConnected,
    notifications,
    clearNotifications,
  } = useSocket({
    enableNotifications: true,
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    keywords: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    emailNotifications: true,
    smsNotifications: false,
    frequency: "DAILY" as const,
  });

  useEffect(() => {
    fetchJobAlerts();
    fetchAlertStats();
  }, []);

  // Handle real-time notifications
  useEffect(() => {
    const jobAlertNotifications = notifications.filter(
      n => n.data?.alertTitle
    );
    
    if (jobAlertNotifications.length > 0) {
      // Refresh alerts when new notifications arrive
      fetchJobAlerts();
      fetchAlertStats();
    }
  }, [notifications]);

  const fetchJobAlerts = async () => {
    try {
      const response = await fetch("/api/job-seeker/job-alerts");
      if (response.ok) {
        const data = await response.json();
        setJobAlerts(data);
      }
    } catch (error) {
      setError("Failed to fetch job alerts");
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertStats = async () => {
    try {
      const response = await fetch("/api/job-seeker/job-alerts/stats");
      if (response.ok) {
        const data = await response.json();
        setAlertStats(data);
      }
    } catch (error) {
      console.error("Error fetching alert stats:", error);
    }
  };

  const handleCreateAlert = async () => {
    try {
      const response = await fetch("/api/job-seeker/job-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        }),
      });

      if (response.ok) {
        setSuccess("Job alert created successfully");
        setShowCreateForm(false);
        resetForm();
        fetchJobAlerts();
        fetchAlertStats();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create job alert");
      }
    } catch (error) {
      setError("An error occurred while creating job alert");
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/job-seeker/job-alerts/${alertId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchJobAlerts();
        fetchAlertStats();
      }
    } catch (error) {
      setError("An error occurred while updating job alert");
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this job alert?")) {
      return;
    }

    try {
      const response = await fetch(`/api/job-seeker/job-alerts/${alertId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Job alert deleted successfully");
        fetchJobAlerts();
        fetchAlertStats();
      }
    } catch (error) {
      setError("An error occurred while deleting job alert");
    }
  };

  const testAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/job-alerts/process?alertId=${alertId}&secret=${process.env.NEXT_PUBLIC_JOB_ALERT_SECRET}`, {
        method: "GET",
      });

      if (response.ok) {
        setSuccess("Test alert processed successfully");
      } else {
        setError("Failed to test alert");
      }
    } catch (error) {
      setError("An error occurred while testing alert");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      keywords: "",
      location: "",
      jobType: "",
      experienceLevel: "",
      salaryMin: "",
      salaryMax: "",
      emailNotifications: true,
      smsNotifications: false,
      frequency: "DAILY",
    });
  };

  const getStatusColor = (alert: JobAlert) => {
    if (!alert.isActive) return "bg-gray-100 text-gray-800";
    if (alert.recentMatches && alert.recentMatches > 0) return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (alert: JobAlert) => {
    if (!alert.isActive) return "Inactive";
    if (alert.recentMatches && alert.recentMatches > 0) return `${alert.recentMatches} new matches`;
    return "Active";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {alertStats.activeAlerts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">
              across all alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.recentNotifications}</div>
            <p className="text-xs text-muted-foreground">
              last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real-time Status</CardTitle>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isConnected ? 'Live' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {notifications.length} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Job Alerts</h2>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <Button variant="outline" onClick={clearNotifications}>
              Clear Notifications ({notifications.length})
            </Button>
          )}
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Job Alerts List */}
      <div className="space-y-4">
        {jobAlerts.map((alert) => (
          <Card key={alert.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <Badge className={getStatusColor(alert)}>
                      {getStatusText(alert)}
                    </Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    {alert.keywords.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span>{alert.keywords.join(", ")}</span>
                      </div>
                    )}
                    {alert.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.location}</span>
                      </div>
                    )}
                    {alert.jobType && (
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{alert.jobType}</span>
                      </div>
                    )}
                    {alert.experienceLevel && (
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>{alert.experienceLevel}</span>
                      </div>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={alert.isActive}
                    onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testAlert(alert.id)}
                  >
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Mail className={`h-4 w-4 ${alert.emailNotifications ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>Email {alert.emailNotifications ? 'On' : 'Off'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Smartphone className={`h-4 w-4 ${alert.smsNotifications ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>SMS {alert.smsNotifications ? 'On' : 'Off'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{alert.frequency}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {alert.lastTriggeredAt && (
                    <span>Last run: {format(new Date(alert.lastTriggeredAt), 'MMM dd, yyyy')}</span>
                  )}
                  {alert.totalJobsFound !== undefined && (
                    <span>Total matches: {alert.totalJobsFound}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {jobAlerts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job alerts yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first job alert to get notified about new opportunities
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Real-time Notifications Preview */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Recent Real-time Notifications</span>
              <Badge className="bg-blue-500">
                {notifications.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">{notification.title}</p>
                    <p className="text-sm text-blue-700">{notification.message}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {format(new Date(notification.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}