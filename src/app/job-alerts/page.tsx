"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Clock
} from "lucide-react";
import Link from "next/link";

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
}

export default function JobAlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);

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
  frequency: "DAILY" as "DAILY" | "WEEKLY" | "INSTANT",
  });

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
      fetchJobAlerts();
    }
  }, [status, session, router]);

  const fetchJobAlerts = async () => {
    try {
      const response = await fetch("/api/job-seeker/job-alerts");
      if (response.ok) {
        const data = await response.json();
        setJobAlerts(data);
      } else {
        setError("Failed to fetch job alerts");
      }
    } catch (error) {
      setError("An error occurred while fetching job alerts");
    } finally {
      setLoading(false);
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
        fetchJobAlerts();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create job alert");
      }
    } catch (error) {
      setError("An error occurred while creating job alert");
    }
  };

  const handleUpdateAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/job-seeker/job-alerts/${alertId}`, {
        method: "PUT",
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
        setSuccess("Job alert updated successfully");
        setEditingAlert(null);
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
        fetchJobAlerts();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update job alert");
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
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete job alert");
      }
    } catch (error) {
      setError("An error occurred while deleting job alert");
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
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update job alert");
      }
    } catch (error) {
      setError("An error occurred while updating job alert");
    }
  };

  const startEditing = (alert: JobAlert) => {
    setEditingAlert(alert.id);
    setFormData({
      title: alert.title,
      keywords: alert.keywords.join(", "),
      location: alert.location,
      jobType: alert.jobType,
      experienceLevel: alert.experienceLevel,
      salaryMin: alert.salaryMin?.toString() || "",
      salaryMax: alert.salaryMax?.toString() || "",
      emailNotifications: alert.emailNotifications,
      smsNotifications: alert.smsNotifications,
      frequency: alert.frequency,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your job alerts...</p>
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
                <Link href="/dashboard/job-seeker" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/jobs" className="text-gray-600 hover:text-blue-600">
                  Browse Jobs
                </Link>
                <Link href="/applications" className="text-gray-600 hover:text-blue-600">
                  My Applications
                </Link>
                <Link href="/job-alerts" className="text-blue-600 font-medium">
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Alerts</h1>
            <p className="text-gray-600">Get notified when new jobs match your criteria</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
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

        {/* Create Alert Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Create New Job Alert</CardTitle>
                  <CardDescription>
                    Set up criteria for job notifications
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Alert Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Software Developer Jobs"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Nicosia, Limassol, Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                      <SelectItem value="REMOTE">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="ENTRY">Entry Level</SelectItem>
                      <SelectItem value="MID">Mid Level</SelectItem>
                      <SelectItem value="SENIOR">Senior Level</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency">Notification Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSTANT">Instant</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum Salary (€)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g., 30000"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Maximum Salary (€)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g., 60000"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                  />
                  <Label htmlFor="emailNotifications" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email notifications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsNotifications"
                    checked={formData.smsNotifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked })}
                  />
                  <Label htmlFor="smsNotifications" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    SMS notifications
                  </Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleCreateAlert}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Alerts List */}
        {jobAlerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job alerts yet</h3>
              <p className="text-gray-600 mb-6">
                Create job alerts to get notified when new positions match your criteria.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {jobAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {alert.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {alert.location || "Any location"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {alert.jobType || "Any type"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {alert.frequency}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {alert.emailNotifications ? "Email" : "No email"}
                        </div>
                      </div>

                      {(alert.salaryMin || alert.salaryMax) && (
                        <div className="text-sm text-gray-600 mt-2">
                          Salary: €{alert.salaryMin || "0"} - €{alert.salaryMax || "Unlimited"}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Created {new Date(alert.createdAt).toLocaleDateString()}
                        {alert.lastTriggeredAt && (
                          <span className="ml-4">
                            Last triggered {new Date(alert.lastTriggeredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAlert(alert.id, !alert.isActive)}
                      >
                        {alert.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(alert)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {editingAlert === alert.id && (
                    <div className="border-t pt-6 mt-6">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`edit-title-${alert.id}`}>Alert Title</Label>
                          <Input
                            id={`edit-title-${alert.id}`}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-location-${alert.id}`}>Location</Label>
                          <Input
                            id={`edit-location-${alert.id}`}
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <Label htmlFor={`edit-keywords-${alert.id}`}>Keywords</Label>
                        <Input
                          id={`edit-keywords-${alert.id}`}
                          value={formData.keywords}
                          onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label htmlFor={`edit-jobType-${alert.id}`}>Job Type</Label>
                          <Select value={formData.jobType} onValueChange={(value) => setFormData({ ...formData, jobType: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any</SelectItem>
                              <SelectItem value="FULL_TIME">Full Time</SelectItem>
                              <SelectItem value="PART_TIME">Part Time</SelectItem>
                              <SelectItem value="CONTRACT">Contract</SelectItem>
                              <SelectItem value="INTERNSHIP">Internship</SelectItem>
                              <SelectItem value="REMOTE">Remote</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`edit-frequency-${alert.id}`}>Frequency</Label>
                          <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INSTANT">Instant</SelectItem>
                              <SelectItem value="DAILY">Daily</SelectItem>
                              <SelectItem value="WEEKLY">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`edit-experience-${alert.id}`}>Experience</Label>
                          <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any</SelectItem>
                              <SelectItem value="ENTRY">Entry Level</SelectItem>
                              <SelectItem value="MID">Mid Level</SelectItem>
                              <SelectItem value="SENIOR">Senior Level</SelectItem>
                              <SelectItem value="EXECUTIVE">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button onClick={() => handleUpdateAlert(alert.id)}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingAlert(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}