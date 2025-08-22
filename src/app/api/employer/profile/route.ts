import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused Prisma enum imports (use string literals for role, size kept as plain string comparisons if needed)

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
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Transform the response
    const transformedProfile = {
      id: employer.id,
      companyName: employer.companyName,
      contactName: employer.contactName,
      contactEmail: employer.contactEmail,
      contactPhone: employer.contactPhone,
      website: employer.website,
      industry: employer.industry,
      description: employer.description,
      address: employer.address,
      city: employer.city,
      postalCode: employer.postalCode,
      country: employer.country,
      size: employer.size,
      logo: employer.logo,
      email: employer.user.email,
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error("Error fetching employer profile:", error);
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
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      website,
      industry,
      description,
      address,
      city,
      postalCode,
      size,
    } = body;

    // Validate required fields
    if (!companyName || !contactName || !contactEmail || !industry) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if employer profile exists
    const existingEmployer = await db.employer.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!existingEmployer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Update profile
    const updatedEmployer = await db.employer.update({
      where: {
        userId: session.user.id,
      },
      data: {
        companyName,
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        website: website || null,
        industry,
        description: description || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
  size: size && ['STARTUP','SMALL','MEDIUM','LARGE','ENTERPRISE'].includes(size) ? size : null,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Log the update for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EMPLOYER_PROFILE_UPDATED",
        entityType: "Employer",
        entityId: updatedEmployer.id,
        changes: JSON.stringify({
          updatedFields: Object.keys(body).filter(key => body[key] !== undefined),
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Transform the response
    const transformedProfile = {
      id: updatedEmployer.id,
      companyName: updatedEmployer.companyName,
      contactName: updatedEmployer.contactName,
      contactEmail: updatedEmployer.contactEmail,
      contactPhone: updatedEmployer.contactPhone,
      website: updatedEmployer.website,
      industry: updatedEmployer.industry,
      description: updatedEmployer.description,
      address: updatedEmployer.address,
      city: updatedEmployer.city,
      postalCode: updatedEmployer.postalCode,
      country: updatedEmployer.country,
      size: updatedEmployer.size,
      logo: updatedEmployer.logo,
      email: updatedEmployer.user.email,
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error("Error updating employer profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}