import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused Prisma enum import

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;

    // Get the job seeker profile
    const jobSeeker = await db.jobSeeker.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    // Check if an application exists
    const application = await db.application.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId: jobSeeker.id,
          jobId: jobId,
        },
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
      },
    });

    return NextResponse.json({
      applied: !!application,
      application: application ? {
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt.toISOString(),
      } : null,
    });
  } catch (error) {
    console.error("Error checking application status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}