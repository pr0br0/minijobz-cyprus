import { NextRequest, NextResponse } from "next/server";
import { ApplicationStatusEnum } from '@/types/database';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole, ApplicationStatus } from "@prisma/client";
import { NotificationService } from "@/lib/notificationService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized. Only job seekers can apply to jobs." },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;

    // Check if the job exists and is published
    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!job || job.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: "Job not found or not available" },
        { status: 404 }
      );
    }

    // Check if job has expired
    if (job.expiresAt && job.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This job has expired and is no longer accepting applications" },
        { status: 410 }
      );
    }

    // Get the job seeker profile
    const jobSeeker = await db.jobSeeker.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await db.application.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId: jobSeeker.id,
          jobId: jobId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }

    // Parse form data for potential file uploads
    const formData = await request.formData();
    const cvFile = formData.get("cvFile") as string;
    const coverLetterFile = formData.get("coverLetterFile") as string;
    const coverLetterText = formData.get("coverLetterText") as string;

    // Create the application with file support
    const application = await db.application.create({
      data: {
        jobSeekerId: jobSeeker.id,
        jobId: jobId,
        status: ApplicationStatusEnum.APPLIED,
        cvUrl: cvFile || jobSeeker.cvUrl,
        coverLetterUrl: coverLetterFile || null,
        coverLetter: coverLetterText || null,
      },
      include: {
        job: {
          include: {
            employer: true,
          },
        },
      },
    });

    // Log the application for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "JOB_APPLICATION_SUBMITTED",
        entityType: "Application",
        entityId: application.id,
        changes: JSON.stringify({
          jobId: jobId,
          jobTitle: application.job.title,
          companyName: application.job.employer?.companyName,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // TODO: Send notification to employer (this would be implemented with email/SMS service)
    
    // Send notification to employer about new application
    try {
      if (job.employer) {
        const notificationData = {
          userId: job.employer.userId,
          email: job.employer.contactEmail || job.employer.user?.email,
          phone: job.employer.contactPhone,
          name: job.employer.contactName || job.employer.companyName,
          preferences: {
            email: true,
            sms: false,
            push: false,
          },
        };

        const templateData = {
          jobTitle: job.title,
          applicantName: `${jobSeeker.firstName} ${jobSeeker.lastName}`,
            applicantBio: jobSeeker.bio,
          appliedAt: application.appliedAt,
          userName: job.employer.contactName || job.employer.companyName,
          userEmail: job.employer.contactEmail || job.employer.user?.email,
        };

        await NotificationService.sendNotification(
          notificationData,
          'NEW_APPLICATION',
          templateData
        );
      }
    } catch (notificationError) {
      console.error('Failed to send new application notification:', notificationError);
      // Don't fail the application if notification fails
    }

    return NextResponse.json({
      message: "Application submitted successfully",
      applicationId: application.id,
      status: application.status,
    });
  } catch (error) {
    console.error("Error submitting job application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}