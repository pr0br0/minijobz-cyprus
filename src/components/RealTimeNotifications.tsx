"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Building,
  Calendar,
  ExternalLink,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface NotificationData {
  id: string;
  type: 'APPLICATION_UPDATE' | 'NEW_APPLICATION' | 'JOB_STATUS_CHANGE' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
  read: boolean;
}

interface RealTimeNotificationsProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

export default function RealTimeNotifications({ 
  maxItems = 10, 
  showHeader = true,
  className = ""
}: RealTimeNotificationsProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const {
    isConnected,
    notifications: socketNotifications,
    markNotificationAsRead,
    clearNotifications,
  } = useSocket({
    enableNotifications: true,
  });

  // Load initial notifications
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  // Handle real-time notifications
  useEffect(() => {
    if (socketNotifications.length > 0) {
      const newNotifications = socketNotifications.map(notif => ({
        ...notif,
        read: false,
      }));
      
      setNotifications(prev => [...newNotifications, ...prev]);
      setUnreadCount(prev => prev + newNotifications.length);
    }
  }, [socketNotifications]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: NotificationData) => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
      case 'SYSTEM':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (notification: NotificationData) => {
    if (notification.read) return 'bg-gray-50';
    
    switch (notification.type) {
      case 'APPLICATION_UPDATE':
        return 'bg-blue-50 border-blue-200';
      case 'NEW_APPLICATION':
        return 'bg-green-50 border-green-200';
      case 'JOB_STATUS_CHANGE':
        return 'bg-purple-50 border-purple-200';
      case 'SYSTEM':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationLink = (notification: NotificationData) => {
    switch (notification.type) {
      case 'APPLICATION_UPDATE':
        return notification.data?.applicationId 
          ? `/applications/${notification.data.applicationId}`
          : '/applications';
      case 'NEW_APPLICATION':
        return notification.data?.jobId 
          ? `/jobs/${notification.data.jobId}/applications`
          : '/dashboard/employer/applications';
      case 'JOB_STATUS_CHANGE':
        return notification.data?.jobId 
          ? `/jobs/${notification.data.jobId}`
          : '/jobs';
      default:
        return '/dashboard';
    }
  };

  const displayNotifications = showAll 
    ? notifications 
    : notifications.slice(0, maxItems);

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </CardTitle>
            <CardDescription>
              Real-time notifications about your applications and job updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAll(!showAll)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAll ? 'Show Less' : 'Show All'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ScrollArea className="h-96">
        <div className="space-y-3">
          {displayNotifications.length > 0 ? (
            displayNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${getNotificationColor(notification)} transition-all hover:shadow-md cursor-pointer`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium">
                          {notification.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {format(new Date(notification.timestamp), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <Link href={getNotificationLink(notification)}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {notification.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
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
        </div>
      </ScrollArea>

      {!showAll && notifications.length > maxItems && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(true)}
            className="w-full"
          >
            View All Notifications ({notifications.length})
          </Button>
        </div>
      )}
    </div>
  );
}