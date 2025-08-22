"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Bell,
  MessageSquare,
  User,
  Building,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  status: string;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface RealTimeApplicationTrackerProps {
  applications: Application[];
  onApplicationClick?: (applicationId: string) => void;
}

export default function RealTimeApplicationTracker({ 
  applications, 
  onApplicationClick 
}: RealTimeApplicationTrackerProps) {
  const { data: session } = useSession();
  const [trackedApplications, setTrackedApplications] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"applications" | "notifications">("applications");
  
  const {
    isConnected,
    notifications,
    applicationUpdates,
    trackApplication,
    untrackApplication,
    clearNotifications,
    markNotificationAsRead,
  } = useSocket({
    enableNotifications: true,
    enableApplicationTracking: true,
  });

  // Auto-track applications when component mounts
  useEffect(() => {
    if (session?.user?.id && applications.length > 0) {
      applications.forEach(app => {
        if (!trackedApplications.has(app.id)) {
          trackApplication(app.id);
          setTrackedApplications(prev => new Set(prev).add(app.id));
        }
      });
    }
  }, [applications, session, trackApplication, trackedApplications]);

  // Clean up tracking when component unmounts
  useEffect(() => {
    return () => {
      trackedApplications.forEach(appId => {
        untrackApplication(appId);
      });
    };
  }, [trackedApplications, untrackApplication]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REVIEWED':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'SHORTLISTED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'HIRED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'SHORTLISTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'HIRED':
        return 'bg-green-100 text-green-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_UPDATE':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'NEW_APPLICATION':
        return <User className="h-4 w-4 text-green-500" />;
      case 'JOB_STATUS_CHANGE':
        return <Building className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'APPLICATION_UPDATE':
        return 'border-blue-200 bg-blue-50';
      case 'NEW_APPLICATION':
        return 'border-green-200 bg-green-50';
      case 'JOB_STATUS_CHANGE':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Real-Time Application Tracking</span>
            </span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Get instant updates on your application status and new notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Tracking {trackedApplications.size} applications</span>
            <span>{notifications.length} unread notifications</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-2 px-1 font-medium text-sm ${
            activeTab === "applications"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`pb-2 px-1 font-medium text-sm relative ${
            activeTab === "notifications"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Notifications
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "applications" ? (
        <div className="space-y-4">
          {applications.map((application) => {
            const latestUpdate = applicationUpdates.find(
              update => update.applicationId === application.id
            );

            return (
              <Card 
                key={application.id} 
                className={`transition-all hover:shadow-md cursor-pointer ${
                  latestUpdate ? 'border-blue-200 bg-blue-50' : ''
                }`}
                onClick={() => onApplicationClick?.(application.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(application.status)}
                      <div>
                        <CardTitle className="text-lg">{application.job.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-2 mt-1">
                          <Building className="h-4 w-4" />
                          <span>{application.job.company.name}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Applied: {format(new Date(application.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      {application.updatedAt !== application.createdAt && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Updated: {format(new Date(application.updatedAt), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                    {latestUpdate && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Bell className="h-4 w-4" />
                        <span>Just updated</span>
                      </div>
                    )}
                  </div>
                  
                  {latestUpdate && (
                    <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Bell className="h-4 w-4" />
                        <span className="font-medium">Status Update</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        {latestUpdate.message || `Application status changed to ${latestUpdate.status}`}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {format(new Date(latestUpdate.timestamp), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {applications.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start applying for jobs to see real-time updates
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recent Notifications</h3>
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearNotifications}>
                Clear All
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-96">
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`${getNotificationColor(notification.type)} cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          <CardTitle className="text-sm">{notification.title}</CardTitle>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(notification.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm">{notification.message}</p>
                      {notification.data && (
                        <div className="mt-2 text-xs text-gray-600">
                          Click to view details
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You'll see real-time updates here
                  </p>
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}