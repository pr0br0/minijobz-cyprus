"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Settings, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Smartphone
} from "lucide-react";
import { useSession } from "next-auth/react";

interface NotificationPreference {
  emailAlerts: boolean;
  smsAlerts: boolean;
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
}

interface JobAlert {
  id: string;
  title: string;
  location?: string;
  industry?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  emailAlerts: boolean;
  smsAlerts: boolean;
  active: boolean;
  createdAt: string;
}

export default function NotificationPreferences() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<NotificationPreference>({
    emailAlerts: true,
    smsAlerts: false,
    frequency: 'DAILY'
  });
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (session) {
      fetchPreferences();
      fetchJobAlerts();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/job-seeker/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchJobAlerts = async () => {
    try {
      const response = await fetch('/api/job-seeker/job-alerts');
      if (response.ok) {
        const data = await response.json();
        setJobAlerts(data.jobAlerts || []);
      }
    } catch (error) {
      console.error('Error fetching job alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/job-seeker/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: 'EMAIL' | 'SMS') => {
    setTesting(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          message: `This is a test ${type.toLowerCase()} notification from Cyprus Jobs. If you receive this, your ${type.toLowerCase()} notifications are working correctly!`
        }),
      });

      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error testing notification:', error);
    } finally {
      setTesting(false);
    }
  };

  const toggleJobAlert = async (alertId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/job-seeker/job-alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (response.ok) {
        setJobAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, active } : alert
          )
        );
      }
    } catch (error) {
      console.error('Error toggling job alert:', error);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'INSTANT': return 'Instant';
      case 'DAILY': return 'Daily';
      case 'WEEKLY': return 'Weekly';
      default: return frequency;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'INSTANT': return 'bg-green-100 text-green-800';
      case 'DAILY': return 'bg-blue-100 text-blue-800';
      case 'WEEKLY': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Sign in to manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please sign in to access notification settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how you receive job alerts and notifications from Cyprus Jobs
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Job Alerts
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications about new job opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive job alerts and updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailAlerts}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, emailAlerts: checked }))
                  }
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive instant job alerts via text message
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.smsAlerts}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, smsAlerts: checked }))
                  }
                />
              </div>

              {/* Notification Frequency */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Notification Frequency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'INSTANT', label: 'Instant', desc: 'Get alerts immediately' },
                    { value: 'DAILY', label: 'Daily', desc: 'Daily digest' },
                    { value: 'WEEKLY', label: 'Weekly', desc: 'Weekly summary' }
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        preferences.frequency === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => 
                        setPreferences(prev => ({ ...prev, frequency: option.value as any }))
                      }
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={savePreferences} 
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Alerts</CardTitle>
              <CardDescription>
                Manage your active job alerts and their notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : jobAlerts.length > 0 ? (
                <div className="space-y-4">
                  {jobAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{alert.title || 'All Jobs'}</h4>
                            <Badge className={getFrequencyColor(alert.frequency)}>
                              {getFrequencyLabel(alert.frequency)}
                            </Badge>
                            {alert.active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            {alert.location && (
                              <div>Location: {alert.location}</div>
                            )}
                            {alert.industry && (
                              <div>Industry: {alert.industry}</div>
                            )}
                            {alert.jobType && (
                              <div>Type: {alert.jobType.replace('_', ' ')}</div>
                            )}
                            {alert.salaryMin && alert.salaryMax && (
                              <div>Salary: €{alert.salaryMin.toLocaleString()} - €{alert.salaryMax.toLocaleString()}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className={`w-4 h-4 ${alert.emailAlerts ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span className={alert.emailAlerts ? 'text-blue-600' : 'text-gray-400'}>
                                Email {alert.emailAlerts ? 'On' : 'Off'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className={`w-4 h-4 ${alert.smsAlerts ? 'text-green-600' : 'text-gray-400'}`} />
                              <span className={alert.smsAlerts ? 'text-green-600' : 'text-gray-400'}>
                                SMS {alert.smsAlerts ? 'On' : 'Off'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.active}
                            onCheckedChange={(checked) => toggleJobAlert(alert.id, checked)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Job Alerts Set Up
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create job alerts to get notified about new opportunities that match your preferences.
                  </p>
                  <Button>Create Job Alert</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>
                Send test notifications to verify your notification settings are working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium">Email Test</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Send a test email to verify your email notifications are working
                  </p>
                  <Button 
                    onClick={() => testNotification('EMAIL')}
                    disabled={testing}
                    variant="outline"
                    className="w-full"
                  >
                    {testing ? 'Sending...' : 'Send Test Email'}
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium">SMS Test</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Send a test SMS to verify your text notifications are working
                  </p>
                  <Button 
                    onClick={() => testNotification('SMS')}
                    disabled={testing}
                    variant="outline"
                    className="w-full"
                  >
                    {testing ? 'Sending...' : 'Send Test SMS'}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Note</h4>
                <p className="text-sm text-blue-800">
                  Test notifications will be sent to your registered email address and phone number. 
                  Make sure your notification preferences are enabled for the type you want to test.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}