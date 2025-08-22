import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Get real-time metrics
    const [
      activeUsers,
      newJobsLast24Hours,
      newApplicationsLast24Hours,
      pageViewsLastHour
    ] = await Promise.all([
      // Active users (logged in last 30 minutes)
      db.user.count({
        where: {
          lastLoginAt: { gte: new Date(now.getTime() - 30 * 60 * 1000) }
        }
      }),
      
      // New jobs in last 24 hours
      db.job.count({
        where: {
          createdAt: { gte: last24Hours },
          status: 'PUBLISHED'
        }
      }),
      
      // New applications in last 24 hours
      db.application.count({
        where: {
          appliedAt: { gte: last24Hours }
        }
      }),
      
      // Mock page views for now (in a real app, this would come from analytics)
      Promise.resolve(Math.floor(Math.random() * 1000) + 500)
    ]);

    // Mock system metrics (in a real app, these would come from system monitoring)
    const systemLoad = Math.random() * 2; // 0-2 load average
    const responseTime = Math.floor(Math.random() * 300) + 50; // 50-350ms

    const metrics = {
      activeUsers,
      newJobs: newJobsLast24Hours,
      newApplications: newApplicationsLast24Hours,
      pageViews: pageViewsLastHour,
      systemLoad,
      responseTime
    };

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error("Error fetching real-time metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}