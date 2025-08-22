import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused Prisma enum import

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

    // Get recent applications with job and applicant details
    const recentApplications = await db.application.findMany({
      where: {
        job: {
          employerId: employer.id,
        },
      },
      include: {
        job: {
          select: {
            title: true,
          },
        },
        jobSeeker: {
          select: {
            firstName: true,
            lastName: true,
            cvUrl: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
      take: 10, // Limit to 10 most recent applications
    });

    // Transform the response
    const transformedApplications = recentApplications.map((application) => ({
      id: application.id,
      jobTitle: application.job.title,
      applicantName: `${application.jobSeeker.firstName} ${application.jobSeeker.lastName}`,
      status: application.status,
      appliedAt: application.appliedAt.toISOString(),
      hasCV: !!application.jobSeeker.cvUrl,
    }));

    return NextResponse.json({
      applications: transformedApplications,
    });
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}