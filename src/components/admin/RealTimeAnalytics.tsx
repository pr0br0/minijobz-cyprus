"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Clock,
  Eye,
  RefreshCw
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface RealTimeMetrics {
  activeUsers: number;
  newJobs: number;
  newApplications: number;
  pageViews: number;
  systemLoad: number;
  responseTime: number;
}

interface RecentActivity {
  id: string;
  type: 'job_posted' | 'application_submitted' | 'user_registered' | 'payment_received';
  message: string;
  timestamp: string;
  details?: any;
}

export default function RealTimeAnalytics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeUsers: 0,
    newJobs: 0,
    newApplications: 0,
    pageViews: 0,
    systemLoad: 0,
    responseTime: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to real-time analytics');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from real-time analytics');
    });

    // Listen for real-time updates
    newSocket.on('metrics_update', (data: RealTimeMetrics) => {
      setMetrics(data);
    });

    newSocket.on('new_activity', (activity: RecentActivity) => {
      setRecentActivity(prev => [activity, ...prev.slice(0, 9)]); // Keep last 10 activities
    });

    setSocket(newSocket);

    // Fetch initial data
    fetchInitialData();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch initial metrics
      const metricsRes = await fetch('/api/admin/realtime-metrics');
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics);
      }

      // Fetch recent activity
      const activityRes = await fetch('/api/admin/recent-activity');
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.activities);
      }
    } catch (error) {
      console.error('Error fetching initial real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'job_posted':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'application_submitted':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'user_registered':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'payment_received':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: RecentActivity['type']) => {
    switch (type) {
      case 'job_posted':
        return <Badge className="bg-blue-500">Job Posted</Badge>;
      case 'application_submitted':
        return <Badge className="bg-green-500">Application</Badge>;
      case 'user_registered':
        return <Badge className="bg-purple-500">New User</Badge>;
      case 'payment_received':
        return <Badge className="bg-yellow-500">Payment</Badge>;
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, description }: {
    title: string;
    value: number | string;
    icon: any;
    trend?: 'up' | 'down' | 'stable';
    description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 mt-1">
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm text-muted-foreground">
              {connected ? 'Live updates active' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={connected ? "default" : "secondary"}>
            <Zap className="h-3 w-3 mr-1" />
            {connected ? 'Live' : 'Offline'}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchInitialData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          icon={Users}
          trend="stable"
          description="Currently online"
        />
        <MetricCard
          title="New Jobs Today"
          value={metrics.newJobs}
          icon={Briefcase}
          trend="up"
          description="Last 24 hours"
        />
        <MetricCard
          title="Applications"
          value={metrics.newApplications}
          icon={FileText}
          trend="up"
          description="Today"
        />
        <MetricCard
          title="Page Views"
          value={metrics.pageViews}
          icon={Eye}
          trend="stable"
          description="Last hour"
        />
      </div>

      {/* System Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Current system health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">System Load</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(metrics.systemLoad * 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {metrics.systemLoad.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Response Time</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metrics.responseTime < 200 ? 'bg-green-500' : 
                        metrics.responseTime < 500 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(metrics.responseTime / 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {metrics.responseTime}ms
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Real-time data stream information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">WebSocket</span>
                <Badge variant={connected ? "default" : "destructive"}>
                  {connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Update</span>
                <span className="text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Just now
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Points</span>
                <span className="text-sm text-muted-foreground">
                  {recentActivity.length} activities
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live platform activity feed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getActivityBadge(activity.type)}
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-gray-600 mt-1">
                        {JSON.stringify(activity.details)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}