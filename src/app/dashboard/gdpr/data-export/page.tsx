"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Database,
  Eye,
  Mail,
  User,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface ExportHistory {
  id: string;
  exportedAt: string;
  format: string;
  status: string;
  downloadUrl?: string;
}

export default function GDPRDataExport() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "pdf">("json");
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Mock export history data
  const mockHistory: ExportHistory[] = [
    {
      id: "1",
      exportedAt: "2024-01-15T10:30:00Z",
      format: "pdf",
      status: "completed",
      downloadUrl: "/api/gdpr/download/1",
    },
    {
      id: "2",
      exportedAt: "2024-01-10T14:20:00Z",
      format: "json",
      status: "completed",
      downloadUrl: "/api/gdpr/download/2",
    },
  ];

  const handleExport = async () => {
    if (!session) return;

    setExporting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/gdpr/data-export-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: exportFormat }),
      });

      if (response.ok) {
        if (exportFormat === 'pdf') {
          // Handle PDF download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `gdpr-data-export-${session.user.id}-${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setMessage({ type: "success", text: "PDF exported successfully!" });
        } else {
          // Handle JSON download
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `gdpr-data-export-${session.user.id}-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setMessage({ type: "success", text: "JSON data exported successfully!" });
        }
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Export failed" });
      }
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: "error", text: "An error occurred during export" });
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = async (exportId: string) => {
    try {
      const response = await fetch(`/api/gdpr/download/${exportId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `gdpr-data-export-${exportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              Please sign in to access your data export features.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => router.push("/auth/signin")}>
                Sign In
              </Button>
            </div>
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
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GDPR Data Export</h1>
              <p className="text-gray-600 mt-1">
                Download your personal data in compliance with GDPR regulations
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {message && (
            <Alert className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="export" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export Data</TabsTrigger>
              <TabsTrigger value="history">Export History</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Data Export</span>
                  </CardTitle>
                  <CardDescription>
                    Export all your personal data stored on our platform. You can choose between JSON format for technical use or PDF format for easy reading.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${
                        exportFormat === "json" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                      }`}
                      onClick={() => setExportFormat("json")}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">JSON Format</span>
                          </div>
                          {exportFormat === "json" && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">
                          Machine-readable format ideal for developers and technical users. Contains all your data in structured format.
                        </p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all ${
                        exportFormat === "pdf" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                      }`}
                      onClick={() => setExportFormat("pdf")}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-green-600" />
                            <span className="font-medium">PDF Format</span>
                          </div>
                          {exportFormat === "pdf" && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">
                          Human-readable format with professional formatting. Easy to review and share with third parties.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">What's included in your export?</h4>
                        <ul className="mt-2 text-sm text-blue-800 space-y-1">
                          <li>• Basic profile information and account details</li>
                          <li>• Job seeker or employer profile data</li>
                          <li>• Applications and job history</li>
                          <li>• Skills and qualifications</li>
                          <li>• Consent and preference settings</li>
                          <li>• Newsletter subscription information</li>
                          <li>• Activity and audit logs</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={handleExport}
                      disabled={exporting}
                      className="flex-1"
                    >
                      {exporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Export {exportFormat.toUpperCase()} Data
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Data Retention Policy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">2-Year Retention Period</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          We retain your personal data for 2 years from your last activity. After this period, your data is automatically deleted unless required for legal purposes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Your Rights</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Under GDPR, you have the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Contact DPO</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          For questions about data protection, contact our Data Protection Officer at dpo@cyprusjobs.com
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Export History</span>
                  </CardTitle>
                  <CardDescription>
                    View and download your previous data exports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockHistory.map((exportItem) => (
                      <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Data Export #{exportItem.id}</p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(exportItem.exportedAt), "MMM dd, yyyy 'at' HH:mm")}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {exportItem.format.toUpperCase()}
                          </Badge>
                          <Badge className={
                            exportItem.status === "completed" 
                              ? "bg-green-500" 
                              : "bg-yellow-500"
                          }>
                            {exportItem.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {exportItem.downloadUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(exportItem.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {mockHistory.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No export history available</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Your first export will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}