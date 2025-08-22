import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Server } from "socket.io";
import { NotificationService } from "@/lib/notificationService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId } = await params;
    const { status, message } = await request.json();

    // Validate status
    const validStatuses = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get the application with related data
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            employer: {
              include: {
                user: true,
              },
            },
          },
        },
        jobSeeker: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === "EMPLOYER") {
      // Employers can only update applications for their jobs
      if (application.job.employer.userId !== session.user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (session.user.role === "JOB_SEEKER") {
      // Job seekers can only update their own applications (limited actions)
      if (application.jobSeeker.userId !== session.user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      // Job seekers can only withdraw applications
      if (status !== "WITHDRAWN") {
        return NextResponse.json({ error: "Invalid action for job seeker" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update the application status
    const updatedApplication = await db.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: {
          include: {
            employer: {
              include: {
                user: true,
              },
            },
          },
        },
        jobSeeker: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send email notification to job seeker (if updated by employer)
    if (session.user.role === "EMPLOYER") {
      try {
        const notificationData = {
          userId: application.jobSeeker.userId,
          email: application.jobSeeker.user.email,
          phone: application.jobSeeker.phone,
          name: application.jobSeeker.user.name || application.jobSeeker.firstName,
          preferences: {
            email: true, // Always send email for application updates
            sms: false, // SMS would require additional consent
            push: false,
          },
        };

        const templateData = {
          jobTitle: application.job.title,
          companyName: application.job.employer.companyName,
          status,
          message,
          applicationId,
          userName: application.jobSeeker.user.name || application.jobSeeker.firstName,
          userEmail: application.jobSeeker.user.email,
        };

        await NotificationService.sendNotification(
          notificationData,
          'APPLICATION_UPDATE',
          templateData
        );
      } catch (notificationError) {
        console.error('Failed to send application update notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    // Send real-time notification via Socket.IO
    try {
      const { Server } = await import("socket.io");
      const io = new Server(); // This should be your existing socket.io server instance
      
      const updateData = {
        applicationId,
        status,
        jobId: application.jobId,
        jobTitle: application.job.title,
  companyName: application.job.employer.companyName,
        userId: application.jobSeeker.userId,
        employerId: application.job.employer.userId,
        timestamp: new Date().toISOString(),
        message,
      };

      // Emit to all clients in the application room
      io.to(`application_${applicationId}`).emit('application_status_update', updateData);
      
      // Also emit to specific users
      io.to(`user_${application.jobSeeker.userId}`).emit('application_status_update', updateData);
      io.to(`user_${application.job.employer.userId}`).emit('application_status_update', updateData);

    } catch (socketError) {
      console.error('Socket.IO notification failed:', socketError);
      // Don't fail the request if socket notification fails
    }

    // Log the status change
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "APPLICATION_STATUS_UPDATE",
        entityType: "APPLICATION",
        entityId: applicationId,
        changes: JSON.stringify({
          from: application.status,
          to: status,
          message,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      application: updatedApplication,
      message: "Application status updated successfully",
    });

  } catch (error) {
    console.error("Application status update error:", error);
    
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}