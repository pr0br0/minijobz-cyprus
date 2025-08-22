import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused Prisma enum imports

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

    // Get job statistics
    const [
      totalJobs,
      activeJobs,
      expiredJobs,
      featuredJobs,
      totalApplications,
      recentApplications
    ] = await Promise.all([
      // Total jobs
      db.job.count({
        where: {
          employerId: employer.id,
        },
      }),
      
      // Active jobs
      db.job.count({
        where: {
          employerId: employer.id,
          status: 'PUBLISHED',
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      }),
      
      // Expired jobs
      db.job.count({
        where: {
          employerId: employer.id,
          status: 'PUBLISHED',
          expiresAt: { lt: new Date() },
        },
      }),
      
      // Featured jobs
      db.job.count({
        where: {
          employerId: employer.id,
          featured: true,
          status: 'PUBLISHED',
        },
      }),
      
      // Total applications
      db.application.count({
        where: {
          job: {
            employerId: employer.id,
          },
        },
      }),
      
      // Recent applications (last 7 days)
      db.application.count({
        where: {
          job: {
            employerId: employer.id,
          },
          appliedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          },
        },
      }),
    ]);

    const stats = {
      totalJobs,
      activeJobs,
      expiredJobs,
      featuredJobs,
      totalApplications,
      recentApplications,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching employer stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}