import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
// Prisma enums referenced via string literals to avoid type issues during migration

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      email,
      password,
      contactName,
      contactEmail,
      contactPhone,
      website,
      industry,
      description,
      address,
      city,
      postalCode,
      companySize,
      gdprConsents,
    } = body;

    // Validate required fields
    if (!companyName || !email || !password || !contactName) {
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

    // Create user, employer, and company profiles in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: contactName,
          role: 'EMPLOYER',
          dataRetentionConsent: gdprConsents.dataRetention,
          marketingConsent: gdprConsents.marketing,
          jobAlertConsent: false, // Employers don't need job alerts
        },
      });

      // Create employer profile
      const employer = await prisma.employer.create({
        data: {
          userId: user.id,
          companyName,
          contactName,
          contactEmail: contactEmail || email,
          contactPhone,
          website,
          industry,
          description,
          address,
          city,
          postalCode,
          country: "Cyprus",
          size: companySize || null,
        },
      });

      // Create company profile
      const company = await prisma.company.create({
        data: {
          employerId: employer.id,
          description,
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

      // Log user creation for audit trail
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_CREATED",
          entityType: "User",
          entityId: user.id,
          changes: JSON.stringify({
            role: 'EMPLOYER',
            email: email,
            companyName: companyName,
          }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      return { user, employer, company };
    });

    // Return success response (don't include sensitive data)
    return NextResponse.json({
      message: "Registration successful",
      userId: result.user.id,
      email: result.user.email,
      companyName: result.employer.companyName,
    });
  } catch (error) {
    console.error("Employer registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}