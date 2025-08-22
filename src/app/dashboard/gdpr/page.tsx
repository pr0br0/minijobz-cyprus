"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Trash2, 
  Shield, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface ConsentSettings {
  dataRetention: boolean;
  marketing: boolean;
  jobAlerts: boolean;
}

export default function GDPRDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [consentLoading, setConsentLoading] = useState(true);
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    dataRetention: true,
    marketing: false,
    jobAlerts: true,
  });

  useEffect(() => {
    fetchConsentSettings();
  }, []);

  const fetchConsentSettings = async () => {
    try {
      const response = await fetch('/api/gdpr/consent');
      if (response.ok) {
        const data = await response.json();
        setConsentSettings(data.currentConsents);
      }
    } catch (error) {
      console.error('Failed to fetch consent settings:', error);
      toast.error("Failed to load consent settings.");
    } finally {
      setConsentLoading(false);
    }
  };

  const handleDataExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gdpr/data-export', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();
      setExportData(data);

      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Your data has been exported and downloaded successfully!");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch('/api/gdpr/account-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmation: "DELETE_MY_ACCOUNT",
          reason: "User requested deletion via GDPR dashboard",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success("Your account and all associated data have been permanently deleted.");
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      console.error('Deletion error:', error);
      toast.error("Failed to delete account. Please try again or contact support.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConsentChange = async (type: keyof ConsentSettings, value: boolean) => {
    const originalValue = consentSettings[type];
    // Optimistically update the UI
    setConsentSettings(prev => ({ ...prev, [type]: value }));

    try {
      const response = await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type.toUpperCase(),
          action: value ? 'GRANTED' : 'REVOKED',
        }),
      });

      if (!response.ok) {
        // Revert on error
        setConsentSettings(prev => ({ ...prev, [type]: originalValue }));
        throw new Error('Failed to update consent');
      }

      toast.success(`Consent preferences updated successfully!`);
    } catch (error) {
      console.error('Consent update error:', error);
      // Revert on error
      setConsentSettings(prev => ({ ...prev, [type]: originalValue }));
      toast.error("Failed to update consent. Please try again.");
    }
  };

  const dataSummary = exportData?.dataSummary || {};

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Privacy Dashboard</h1>
        <p className="text-gray-600">
          Manage your personal data and exercise your GDPR rights
        </p>
      </div>

      {/* Data Export Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your personal data stored on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You have the right to request a copy of all personal data we hold about you. 
              This includes your profile information, application history, and activity logs.
            </p>
            
            {exportData && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Data Export Summary</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>Basic Information: {dataSummary.basicInfo ? "✓" : "✗"}</div>
                    <div>Job Seeker Profile: {dataSummary.jobSeekerProfile ? "✓" : "✗"}</div>
                    <div>Employer Profile: {dataSummary.employerProfile ? "✓" : "✗"}</div>
                    <div>Consent Logs: {dataSummary.consentLogs || 0}</div>
                    <div>Audit Logs: {dataSummary.auditLogs || 0}</div>
                    <div>Newsletter: {dataSummary.newsletterSubscription ? "✓" : "✗"}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleDataExport} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Exporting Data...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consent Management Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
            Consent Preferences
          </CardTitle>
          <CardDescription>
            Manage your consent for data processing and communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consentLoading ? (
              <div className="space-y-4">
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Data Retention</h4>
                      <p className="text-sm text-gray-600">
                        Allow us to retain your data as long as your account is active
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={consentSettings.dataRetention ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleConsentChange('dataRetention', !consentSettings.dataRetention)}
                  >
                    {consentSettings.dataRetention ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Marketing Communications</h4>
                      <p className="text-sm text-gray-600">
                        Receive updates about new features and platform news
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={consentSettings.marketing ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleConsentChange('marketing', !consentSettings.marketing)}
                  >
                    {consentSettings.marketing ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded">
                      <FileText className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Job Alerts</h4>
                      <p className="text-sm text-gray-600">
                        Receive notifications about new job opportunities
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={consentSettings.jobAlerts ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleConsentChange('jobAlerts', !consentSettings.jobAlerts)}
                  >
                    {consentSettings.jobAlerts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Irreversible Action</AlertTitle>
              <AlertDescription>
                This action cannot be undone. All your personal data, including profile information, 
                application history, and saved jobs will be permanently deleted.
              </AlertDescription>
            </Alert>

            {showDeleteConfirm && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Final Confirmation</AlertTitle>
                <AlertDescription>
                  Are you absolutely sure you want to delete your account? 
                  Type "DELETE_MY_ACCOUNT" to confirm this irreversible action.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="destructive"
                onClick={handleAccountDeletion}
                disabled={deleteLoading}
                className="flex-1"
              >
                {deleteLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {showDeleteConfirm ? "Confirm Deletion" : "Delete My Account"}
                  </>
                )}
              </Button>
              
              {showDeleteConfirm && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Your GDPR Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Data Rights</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Right to access your personal data
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Right to rectify inaccurate data
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Right to erasure (Right to be forgotten)
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Right to restrict processing
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Additional Rights</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Right to data portability
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Right to object to processing
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Right to withdraw consent
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Right to lodge a complaint
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}