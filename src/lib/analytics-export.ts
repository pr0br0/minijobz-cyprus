// Local copy of AnalyticsData interface (cannot import named export if component uses default export)
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
    systemHealth: { uptime: string; responseTime: string; errorRate: string };
    uptime: string;
  };
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  dateRange: string;
  includeCharts: boolean;
}

export class AnalyticsExporter {
  static exportToCSV(data: AnalyticsData, filename: string = 'analytics') {
    const csvContent = this.generateCSV(data);
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  static exportToJSON(data: AnalyticsData, filename: string = 'analytics') {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  private static generateCSV(data: AnalyticsData): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Cyprus Jobs Platform - Analytics Export');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // User Metrics
    lines.push('USER METRICS');
    lines.push('Metric,Value');
    lines.push(`Total Users,${data.users.total}`);
    lines.push(`New Users (30 days),${data.users.newLast30Days}`);
    lines.push(`New Users (7 days),${data.users.newLast7Days}`);
    lines.push(`Active Users (30 days),${data.users.activeLast30Days}`);
    lines.push(`Growth Rate,${data.users.growthRate}%`);
    lines.push('');

    // Users by Role
    lines.push('USERS BY ROLE');
    lines.push('Role,Count');
    data.users.byRole.forEach(role => {
      lines.push(`${role.role},${role._count.role}`);
    });
    lines.push('');

    // Job Metrics
    lines.push('JOB METRICS');
    lines.push('Metric,Value');
    lines.push(`Total Jobs,${data.jobs.total}`);
    lines.push(`Active Jobs,${data.jobs.active}`);
    lines.push(`New Jobs (30 days),${data.jobs.newLast30Days}`);
    lines.push(`New Jobs (7 days),${data.jobs.newLast7Days}`);
    lines.push(`Growth Rate,${data.jobs.growthRate}%`);
    lines.push(`Featured Jobs,${data.jobs.featured}`);
    lines.push(`Urgent Jobs,${data.jobs.urgent}`);
    lines.push(`Fill Rate,${data.jobs.fillRate}%`);
    lines.push('');

    // Jobs by Status
    lines.push('JOBS BY STATUS');
    lines.push('Status,Count');
    data.jobs.byStatus.forEach(status => {
      lines.push(`${status.status},${status._count.status}`);
    });
    lines.push('');

    // Jobs by Type
    lines.push('JOBS BY TYPE');
    lines.push('Type,Count');
    data.jobs.byType.forEach(type => {
      lines.push(`${type.type},${type._count.type}`);
    });
    lines.push('');

    // Top Locations
    lines.push('TOP JOB LOCATIONS');
    lines.push('Location,Job Count');
    data.jobs.topLocations.forEach(location => {
      lines.push(`${location.location},${location._count.location}`);
    });
    lines.push('');

    // Application Metrics
    lines.push('APPLICATION METRICS');
    lines.push('Metric,Value');
    lines.push(`Total Applications,${data.applications.total}`);
    lines.push(`New Applications (30 days),${data.applications.newLast30Days}`);
    lines.push(`New Applications (7 days),${data.applications.newLast7Days}`);
    lines.push(`Growth Rate,${data.applications.growthRate}%`);
    lines.push(`Conversion Rate,${data.applications.conversionRate}%`);
    lines.push(`Average Applications per Job,${data.applications.averagePerJob}`);
    lines.push('');

    // Applications by Status
    lines.push('APPLICATIONS BY STATUS');
    lines.push('Status,Count');
    data.applications.byStatus.forEach(status => {
      lines.push(`${status.status},${status._count.status}`);
    });
    lines.push('');

    // Applications by Day
    lines.push('APPLICATIONS BY DAY');
    lines.push('Date,Count');
    data.applications.byDay.forEach(day => {
      lines.push(`${day.date},${day.count}`);
    });
    lines.push('');

    // Employer Metrics
    lines.push('EMPLOYER METRICS');
    lines.push('Metric,Value');
    lines.push(`Total Employers,${data.employers.total}`);
    lines.push(`Active Employers,${data.employers.active}`);
    lines.push(`New Employers (30 days),${data.employers.newLast30Days}`);
    lines.push(`Growth Rate,${data.employers.growthRate}%`);
    lines.push('');

    // Employers by Size
    lines.push('EMPLOYERS BY SIZE');
    lines.push('Size,Count');
    data.employers.bySize.forEach(size => {
      lines.push(`${size.size || 'Unknown'},${size._count.size}`);
    });
    lines.push('');

    // Top Employers
    lines.push('TOP EMPLOYERS BY JOB COUNT');
    lines.push('Company,Job Count');
    data.employers.topByJobCount.forEach(employer => {
      lines.push(`${employer.companyName},${employer.jobCount}`);
    });
    lines.push('');

    // Revenue Metrics
    lines.push('REVENUE METRICS');
    lines.push('Metric,Value (EUR)');
    lines.push(`Total Revenue,${(data.revenue.total / 100).toFixed(2)}`);
    lines.push(`Revenue (30 days),${(data.revenue.last30Days / 100).toFixed(2)}`);
    lines.push(`Revenue (7 days),${(data.revenue.last7Days / 100).toFixed(2)}`);
    lines.push(`Average Order Value,${data.revenue.averageOrderValue}`);
    lines.push('');

    // Revenue by Status
    lines.push('REVENUE BY STATUS');
    lines.push('Status,Count,Total (EUR)');
    data.revenue.byStatus.forEach(status => {
      lines.push(`${status.status},${status._count.status},${(status._sum.amount / 100).toFixed(2)}`);
    });
    lines.push('');

    // Revenue by Type
    lines.push('REVENUE BY TYPE');
    lines.push('Type,Count,Total (EUR)');
    data.revenue.byType.forEach(type => {
      lines.push(`${type.type},${type._count.type},${(type._sum.amount / 100).toFixed(2)}`);
    });
    lines.push('');

    // Revenue by Month
    lines.push('REVENUE BY MONTH');
    lines.push('Month,Revenue (EUR),Count');
    data.revenue.byMonth.forEach(month => {
      lines.push(`${month.month},${(month.revenue / 100).toFixed(2)},${month.count}`);
    });
    lines.push('');

    // Performance Metrics
    lines.push('PERFORMANCE METRICS');
    lines.push('Metric,Value');
    lines.push(`Average Response Time,${data.performance.averageResponseTime} days`);
    lines.push(`GDPR Requests Processed,${data.performance.gdprRequestsProcessed}`);
    lines.push(`System Uptime,${data.performance.uptime}`);
    lines.push(`Response Time,${data.performance.systemHealth.responseTime}`);
    lines.push(`Error Rate,${data.performance.systemHealth.errorRate}`);
    lines.push('');

    return lines.join('\n');
  }

  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static generateSummaryReport(data: AnalyticsData): string {
    return `
CYPRUS JOBS PLATFORM - ANALYTICS SUMMARY REPORT
Generated: ${new Date().toLocaleString()}

=== KEY METRICS ===
• Total Users: ${data.users.total.toLocaleString()} (${data.users.growthRate}% growth)
• Active Jobs: ${data.jobs.active.toLocaleString()} (${data.jobs.growthRate}% growth)
• Total Applications: ${data.applications.total.toLocaleString()} (${data.applications.growthRate}% growth)
• Total Revenue: €${(data.revenue.total / 100).toLocaleString()}

=== USER INSIGHTS ===
• Active Users (30 days): ${data.users.activeLast30Days.toLocaleString()}
• New Users (30 days): ${data.users.newLast30Days.toLocaleString()}
• Top User Role: ${data.users.byRole.reduce((max, role) => role._count.role > max._count.role ? role : max).role}

=== JOB MARKET INSIGHTS ===
• Job Fill Rate: ${data.jobs.fillRate}%
• Featured Jobs: ${data.jobs.featured} (${((data.jobs.featured / data.jobs.active) * 100).toFixed(1)}% of active jobs)
• Urgent Jobs: ${data.jobs.urgent} (${((data.jobs.urgent / data.jobs.active) * 100).toFixed(1)}% of active jobs)
• Top Location: ${data.jobs.topLocations[0]?.location || 'N/A'}

=== APPLICATION INSIGHTS ===
• Application Conversion Rate: ${data.applications.conversionRate}%
• Average Applications per Job: ${data.applications.averagePerJob}
• Recent Applications (30 days): ${data.applications.newLast30Days.toLocaleString()}

=== REVENUE INSIGHTS ===
• Revenue (30 days): €${(data.revenue.last30Days / 100).toLocaleString()}
• Average Order Value: €${data.revenue.averageOrderValue}
• Top Payment Type: ${data.revenue.byType.reduce((max, type) => (type._sum.amount || 0) > (max._sum.amount || 0) ? type : max).type}

=== PERFORMANCE METRICS ===
• Average Response Time: ${data.performance.averageResponseTime} days
• System Uptime: ${data.performance.uptime}
• GDPR Requests Processed: ${data.performance.gdprRequestsProcessed}

=== TOP EMPLOYERS ===
${data.employers.topByJobCount.slice(0, 5).map((emp, i) => `${i + 1}. ${emp.companyName}: ${emp.jobCount} jobs`).join('\n')}

=== RECOMMENDATIONS ===
1. ${parseFloat(data.jobs.fillRate) < 70 ? 'Focus on job quality and employer engagement to improve fill rate.' : 'Maintain current job fill rate through quality employer partnerships.'}
2. ${parseFloat(data.applications.conversionRate) < 50 ? 'Improve job descriptions and application process to increase conversion rate.' : 'Excellent application conversion rate - continue current strategies.'}
3. ${parseFloat(data.users.growthRate) < 5 ? 'Implement user acquisition campaigns to boost growth.' : 'Strong user growth - focus on retention and engagement.'}
4. ${data.revenue.last30Days < 10000 ? 'Explore premium features and pricing optimization to increase revenue.' : 'Healthy revenue stream - consider expansion opportunities.'}
    `.trim();
  }
}