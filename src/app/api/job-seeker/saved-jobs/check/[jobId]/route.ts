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

    // Check if the job is saved
    // Note: This assumes you have a SavedJob model. If not, you'll need to create it.
    // For now, I'll create a simple implementation that checks a saved_jobs table.
    
    const savedJob = await db.savedJob.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId: jobSeeker.id,
          jobId: jobId,
        },
      },
    });

    return NextResponse.json({
      saved: !!savedJob,
    });
  } catch (error) {
    console.error("Error checking saved job status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}