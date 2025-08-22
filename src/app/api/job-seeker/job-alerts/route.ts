import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Using string literals for frequency validation to avoid enum import mismatches

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jobAlerts = await db.jobAlert.findMany({
      where: {
        jobSeeker: {
          userId: session.user.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(jobAlerts);
  } catch (error) {
    console.error("Error fetching job alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      location,
      jobType,
      salaryMin,
      salaryMax,
      emailAlerts,
      smsAlerts,
      frequency,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

  const allowedFrequencies = ['INSTANT', 'DAILY', 'WEEKLY'];
  if (frequency && !allowedFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency" },
        { status: 400 }
      );
    }

    // Check if job seeker profile exists
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

    // Create job alert
    const jobAlert = await db.jobAlert.create({
      data: {
        jobSeekerId: jobSeeker.id,
        title,
        location: location || null,
        jobType: jobType || null,
        salaryMin: salaryMin ?? null,
        salaryMax: salaryMax ?? null,
        emailAlerts: emailAlerts ?? true,
        smsAlerts: smsAlerts ?? false,
        frequency: frequency || 'DAILY',
        active: true,
      },
    });

    // Log the job alert creation for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "JOB_ALERT_CREATED",
        entityType: "JobAlert",
        entityId: jobAlert.id,
        changes: JSON.stringify({
          title,
          location,
          frequency,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      id: jobAlert.id,
      title: jobAlert.title,
      location: jobAlert.location,
      jobType: jobAlert.jobType,
      salaryMin: jobAlert.salaryMin,
      salaryMax: jobAlert.salaryMax,
  emailAlerts: jobAlert.emailAlerts,
  smsAlerts: jobAlert.smsAlerts,
      frequency: jobAlert.frequency,
  active: jobAlert.active,
      createdAt: jobAlert.createdAt.toISOString(),
      message: "Job alert created successfully",
    });
  } catch (error) {
    console.error("Error creating job alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}