import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused enum import

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: "Unauthorized" },
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

    // Get recent jobs with application counts
    const recentJobs = await db.job.findMany({
      where: {
        employerId: employer.id,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Limit to 10 most recent jobs
    });

    // Transform the response
    const transformedJobs = recentJobs.map((job) => ({
      id: job.id,
      title: job.title,
      location: job.location,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      applicationsCount: job._count.applications,
      views: Math.floor(Math.random() * 1000) + 100, // Mock views count
    }));

    return NextResponse.json({
      jobs: transformedJobs,
    });
  } catch (error) {
    console.error("Error fetching recent jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}