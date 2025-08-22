import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: "Unauthorized. Only employers can access analytics." },
        { status: 401 }
      );
    }

    // Get the employer profile
    const employer = await db.employer.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const jobId = searchParams.get("jobId");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build where clause for filtering
    const where: any = {
      job: {
        employerId: employer.id,
      },
  appliedAt: {
        gte: startDate,
      },
    };

    if (jobId) {
      where.jobId = jobId;
    }

    // Fetch comprehensive analytics data
    const [
      totalApplications,
      applicationsByStatus,
      applicationsByDay,
      topPerformingJobs,
      applicationSources,
      averageResponseTime,
      conversionFunnel
    ] = await Promise.all([
      // Total applications count
  db.application.count({ where }),

      // Applications by status
  db.application.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      }),

      // Applications by day (for timeline chart)
    db.application.findMany({
        where,
        select: {
      appliedAt: true,
          status: true,
        },
        orderBy: {
      appliedAt: 'asc',
        },
      }),

      // Top performing jobs by application count
  db.job.findMany({
        where: {
          employerId: employer.id,
          applications: {
            some: {
      appliedAt: { gte: startDate },
            },
          },
        },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          applications: {
            _count: 'desc',
          },
        },
        take: 5,
      }),

      // Application sources (guest vs registered)
  db.application.groupBy({
        by: ['jobSeekerId'],
        where,
        _count: {
          jobSeekerId: true,
        },
      }),

      // Average response time
  db.application.findMany({
        where: {
          ...where,
          viewedAt: { not: null },
        },
        select: {
          appliedAt: true,
          viewedAt: true,
        },
      }),

      // Conversion funnel data
  db.application.findMany({
        where,
        select: {
          status: true,
          appliedAt: true,
          viewedAt: true,
          respondedAt: true,
        },
      }),
    ]);

    // Calculate application sources
  const guestApplications = applicationSources.filter(source => !source.jobSeekerId).length;
  const registeredApplications = applicationSources.filter(source => source.jobSeekerId).length;

    // Calculate average response time in hours
    const responseTimes = averageResponseTime.map(app => {
      const applied = new Date(app.appliedAt).getTime();
      const viewed = new Date(app.viewedAt!).getTime();
      return (viewed - applied) / (1000 * 60 * 60); // Convert to hours
    });
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Build applications by day data for charts
    const applicationsByDayMap = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      applicationsByDayMap.set(dateStr, {
        date: dateStr,
        total: 0,
        applied: 0,
        viewed: 0,
        shortlisted: 0,
        rejected: 0,
        hired: 0,
      });
    }

    applicationsByDay.forEach(app => {
      const dateStr = app.appliedAt.toISOString().split('T')[0];
      const dayData = applicationsByDayMap.get(dateStr);
      if (dayData) {
        dayData.total++;
        const key = app.status.toLowerCase();
        if (key in dayData) {
          // @ts-ignore dynamic
          dayData[key]++;
        }
      }
    });

    const applicationsByDayData = Array.from(applicationsByDayMap.values());

    // Calculate conversion funnel
    const funnelData = {
      applied: conversionFunnel.length,
      viewed: conversionFunnel.filter(app => app.viewedAt).length,
      responded: conversionFunnel.filter(app => app.respondedAt).length,
      shortlisted: conversionFunnel.filter(app => app.status === 'SHORTLISTED').length,
      hired: conversionFunnel.filter(app => app.status === 'HIRED').length,
    };

    // Calculate conversion rates
    const conversionRates = {
      viewRate: funnelData.applied > 0 ? (funnelData.viewed / funnelData.applied) * 100 : 0,
      responseRate: funnelData.viewed > 0 ? (funnelData.responded / funnelData.viewed) * 100 : 0,
      shortlistRate: funnelData.responded > 0 ? (funnelData.shortlisted / funnelData.responded) * 100 : 0,
      hireRate: funnelData.shortlisted > 0 ? (funnelData.hired / funnelData.shortlisted) * 100 : 0,
      overallHireRate: funnelData.applied > 0 ? (funnelData.hired / funnelData.applied) * 100 : 0,
    };

    // Calculate status distribution
    const statusDistribution = applicationsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      overview: {
        totalApplications,
        days,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
        guestApplications,
        registeredApplications,
        conversionRates,
      },
      statusDistribution,
      applicationsByDay: applicationsByDayData,
      topPerformingJobs: topPerformingJobs.map(job => ({
        id: job.id,
        title: job.title,
        applicationCount: job._count.applications,
      })),
      conversionFunnel: funnelData,
    });
  } catch (error) {
    console.error("Error fetching employer analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}