import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused Prisma enum import

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;    // Get the job seeker profile
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

    // Check if the job exists and is published
    const job = await db.job.findUnique({
      where: {
        id: jobId,
        status: "PUBLISHED",
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not available" },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSavedJob = await db.savedJob.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId: jobSeeker.id,
          jobId: jobId,
        },
      },
    });

    if (existingSavedJob) {
      return NextResponse.json(
        { error: "Job already saved" },
        { status: 409 }
      );
    }

    // Save the job
    const savedJob = await db.savedJob.create({
      data: {
        jobSeekerId: jobSeeker.id,
        jobId: jobId,
      },
      include: {
        job: {
          select: {
            title: true,
            employer: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    // Log the save action for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "JOB_SAVED",
        entityType: "SavedJob",
        entityId: savedJob.id,
        changes: JSON.stringify({
          jobId: jobId,
          jobTitle: savedJob.job.title,
          companyName: savedJob.job.employer.companyName,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Job saved successfully",
      savedJobId: savedJob.id,
    });
  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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

    // Check if the job is saved
    const savedJob = await db.savedJob.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId: jobSeeker.id,
          jobId: jobId,
        },
      },
    });

    if (!savedJob) {
      return NextResponse.json(
        { error: "Job not found in saved jobs" },
        { status: 404 }
      );
    }

    // Remove the saved job
    await db.savedJob.delete({
      where: {
        id: savedJob.id,
      },
    });

    // Log the unsave action for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "JOB_UNSAVED",
        entityType: "SavedJob",
        entityId: savedJob.id,
        changes: JSON.stringify({
          jobId: jobId,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Job removed from saved jobs successfully",
    });
  } catch (error) {
    console.error("Error unsaving job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}