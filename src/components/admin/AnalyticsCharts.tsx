"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  FileText, 
  DollarSign,
  Download,
  RefreshCw,
  FileDown,
  FileSpreadsheet
} from "lucide-react";
import { AnalyticsExporter } from "@/lib/analytics-export";

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface AnalyticsChartsProps {
  data: AnalyticsData;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function AnalyticsCharts({ data, onRefresh, loading = false }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState("30d");
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    setExportLoading(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `cyprus-jobs-analytics-${timestamp}`;
      
      if (format === 'csv') {
        AnalyticsExporter.exportToCSV(data, filename);
      } else if (format === 'json') {
        AnalyticsExporter.exportToJSON(data, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleSummaryReport = () => {
    const summary = AnalyticsExporter.generateSummaryReport(data);
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyprus-jobs-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format data for charts
  const formatChartData = () => {
    // Applications by day
    const applicationsByDay = data.applications.byDay.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: item.count
    }));

    // Revenue by month
    const revenueByMonth = data.revenue.byMonth.map(item => ({
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: item.revenue / 100, // Convert cents to dollars
      count: item.count
    }));

    // Jobs by status
    const jobsByStatus = data.jobs.byStatus.map(item => ({
      name: item.status,
      value: item._count.status
    }));

    // Applications by status
    const applicationsByStatus = data.applications.byStatus.map(item => ({
      name: item.status,
      value: item._count.status
    }));

    // Users by role
    const usersByRole = data.users.byRole.map(item => ({
      name: item.role,
      value: item._count.role
    }));

    // Top locations
    const topLocations = data.jobs.topLocations.slice(0, 8).map(item => ({
      location: item.location,
      jobs: item._count.location
    }));

    // Top employers
    const topEmployers = data.employers.topByJobCount.slice(0, 8).map(item => ({
      name: item.companyName,
      jobs: item.jobCount
    }));

    return {
      applicationsByDay,
      revenueByMonth,
      jobsByStatus,
      applicationsByStatus,
      usersByRole,
      topLocations,
      topEmployers
    };
  };

  const chartData = formatChartData();

  const MetricCard = ({ title, value, change, icon: Icon, description }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {parseFloat(change) > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            {change}% from last month
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive platform metrics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
            <Select onValueChange={(value) => handleExport(value as 'csv' | 'json')} disabled={exportLoading}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <FileSpreadsheet className="h-4 w-4 mr-2 inline" />
                  CSV
                </SelectItem>
                <SelectItem value="json">
                  <FileDown className="h-4 w-4 mr-2 inline" />
                  JSON
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSummaryReport} disabled={exportLoading}>
              <FileDown className="h-4 w-4 mr-2" />
              Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={data.users.total}
          change={data.users.growthRate}
          icon={Users}
          description={`${data.users.activeLast30Days} active users`}
        />
        <MetricCard
          title="Active Jobs"
          value={data.jobs.active}
          change={data.jobs.growthRate}
          icon={Briefcase}
          description={`${data.jobs.fillRate}% fill rate`}
        />
        <MetricCard
          title="Applications"
          value={data.applications.total}
          change={data.applications.growthRate}
          icon={FileText}
          description={`${data.applications.conversionRate}% conversion rate`}
        />
        <MetricCard
          title="Revenue"
          value={`€${(data.revenue.total / 100).toLocaleString()}`}
          icon={DollarSign}
          description={`${data.revenue.byMonth.length} months tracked`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Over Time</CardTitle>
            <CardDescription>Daily application trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.applicationsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="applications" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${value}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jobs by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
            <CardDescription>Distribution of job statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.jobsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.jobsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>User role distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Job Locations</CardTitle>
            <CardDescription>Most popular job locations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topLocations} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="jobs" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Employers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Employers</CardTitle>
            <CardDescription>Companies with most job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topEmployers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="jobs" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.applications.byStatus.map((status, index) => (
                <div key={status.status} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{status.status}</span>
                  </div>
                  <Badge variant="secondary">{status._count.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Avg Response Time</span>
                <Badge variant="outline">{data.performance.averageResponseTime} days</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">System Uptime</span>
                <Badge variant="outline">{data.performance.uptime}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">GDPR Requests</span>
                <Badge variant="outline">{data.performance.gdprRequestsProcessed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Last 30 Days</span>
                <Badge variant="outline">€{(data.revenue.last30Days / 100).toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last 7 Days</span>
                <Badge variant="outline">€{(data.revenue.last7Days / 100).toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Order Value</span>
                <Badge variant="outline">€{data.revenue.averageOrderValue}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}