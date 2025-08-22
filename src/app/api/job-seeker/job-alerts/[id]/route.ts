import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const alertId = id;
    const body = await request.json();

    // Check if job alert exists and belongs to the user
    const existingAlert = await db.jobAlert.findFirst({
      where: {
        id: alertId,
        jobSeeker: {
          userId: session.user.id,
        },
      },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: "Job alert not found" },
        { status: 404 }
      );
    }

    // Update job alert
  const updatedAlert = await db.jobAlert.update({
      where: {
        id: alertId,
      },
      data: {
    ...(body.title && { title: body.title }),
    ...(body.location !== undefined && { location: body.location || null }),
    ...(body.jobType !== undefined && { jobType: body.jobType || null }),
    ...(body.salaryMin !== undefined && { salaryMin: body.salaryMin ? parseInt(body.salaryMin) : null }),
    ...(body.salaryMax !== undefined && { salaryMax: body.salaryMax ? parseInt(body.salaryMax) : null }),
    ...(body.emailAlerts !== undefined && { emailAlerts: body.emailAlerts }),
    ...(body.smsAlerts !== undefined && { smsAlerts: body.smsAlerts }),
    ...(body.frequency !== undefined && { frequency: body.frequency }),
    ...(body.active !== undefined && { active: body.active }),
      },
    });

    // Log the update for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "JOB_ALERT_UPDATED",
        entityType: "JobAlert",
        entityId: updatedAlert.id,
        changes: JSON.stringify({
          updatedFields: Object.keys(body).filter(key => body[key] !== undefined),
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      id: updatedAlert.id,
      title: updatedAlert.title,
      location: updatedAlert.location,
      jobType: updatedAlert.jobType,
      salaryMin: updatedAlert.salaryMin,
      salaryMax: updatedAlert.salaryMax,
  emailAlerts: updatedAlert.emailAlerts,
  smsAlerts: updatedAlert.smsAlerts,
      frequency: updatedAlert.frequency,
  active: updatedAlert.active,
      createdAt: updatedAlert.createdAt.toISOString(),
      message: "Job alert updated successfully",
    });
  } catch (error) {
    console.error("Error updating job alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const alertId = id;

    // Check if job alert exists and belongs to the user
    const existingAlert = await db.jobAlert.findFirst({
      where: {
        id: alertId,
        jobSeeker: {
          userId: session.user.id,
        },
      },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: "Job alert not found" },
        { status: 404 }
      );
    }

    // Delete job alert
    await db.jobAlert.delete({
      where: {
        id: alertId,
      },
    });

    // Log the deletion for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "JOB_ALERT_DELETED",
        entityType: "JobAlert",
        entityId: alertId,
        changes: JSON.stringify({
          title: existingAlert.title,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Job alert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}