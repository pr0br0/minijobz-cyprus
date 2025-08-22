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

    const employer = await db.employer.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        company: true,
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // If no company record exists, create one
    if (!employer.company) {
      const newCompany = await db.company.create({
        data: {
          employerId: employer.id,
        },
      });
      
      return NextResponse.json(newCompany);
    }

    return NextResponse.json(employer.company);
  } catch (error) {
    console.error("Error fetching company information:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      description,
      mission,
      values,
      benefits,
      linkedin,
      facebook,
      twitter,
      instagram,
    } = body;

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

    // Check if company record exists, if not create it
    let company = await db.company.findUnique({
      where: {
        employerId: employer.id,
      },
    });

    if (!company) {
      company = await db.company.create({
        data: {
          employerId: employer.id,
        },
      });
    }

    // Update company information
    const updatedCompany = await db.company.update({
      where: {
        id: company.id,
      },
      data: {
        description: description || null,
        mission: mission || null,
        values: values || null,
        benefits: benefits || null,
        linkedin: linkedin || null,
        facebook: facebook || null,
        twitter: twitter || null,
        instagram: instagram || null,
      },
    });

    // Log the update for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "COMPANY_INFO_UPDATED",
        entityType: "Company",
        entityId: updatedCompany.id,
        changes: JSON.stringify({
          updatedFields: Object.keys(body).filter(key => body[key] !== undefined),
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company information:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}