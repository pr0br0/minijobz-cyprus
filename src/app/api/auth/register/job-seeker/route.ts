import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
// Use string literals for role and visibility enums during migration

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      location,
      bio,
      title,
      experience,
      education,
      gdprConsents,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and job seeker profile in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: 'JOB_SEEKER',
          dataRetentionConsent: gdprConsents.dataRetention,
          marketingConsent: gdprConsents.marketing,
          jobAlertConsent: gdprConsents.jobAlerts,
        },
      });

      // Create job seeker profile
      const jobSeeker = await prisma.jobSeeker.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone,
          location,
          country: "Cyprus",
          bio,
          title,
          experience: experience ? parseInt(experience) : null,
          education,
          profileVisibility: 'PUBLIC',
        },
      });

      // Log consent for GDPR compliance
      if (gdprConsents.dataRetention) {
        await prisma.consentLog.create({
          data: {
            userId: user.id,
            consentType: "DATA_RETENTION",
            action: "GRANTED",
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
          },
        });
      }

      if (gdprConsents.marketing) {
        await prisma.consentLog.create({
          data: {
            userId: user.id,
            consentType: "MARKETING",
            action: "GRANTED",
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
          },
        });
      }

      if (gdprConsents.jobAlerts) {
        await prisma.consentLog.create({
          data: {
            userId: user.id,
            consentType: "JOB_ALERTS",
            action: "GRANTED",
            ipAddress: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
          },
        });
      }

      // Log user creation for audit trail
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_CREATED",
          entityType: "User",
          entityId: user.id,
          changes: JSON.stringify({
            role: 'JOB_SEEKER',
            email: email,
          }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      return { user, jobSeeker };
    });

    // Return success response (don't include sensitive data)
    return NextResponse.json({
      message: "Registration successful",
      userId: result.user.id,
      email: result.user.email,
    });
  } catch (error) {
    console.error("Job seeker registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}