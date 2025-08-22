import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { type, action } = await request.json();

    if (!type || !action) {
      return NextResponse.json(
        { error: "Consent type and action are required" },
        { status: 400 }
      );
    }

    // Validate consent type
    const validConsentTypes = ["DATA_RETENTION", "MARKETING", "JOB_ALERTS", "COOKIES", "ANALYTICS"];
    if (!validConsentTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid consent type" },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ["GRANTED", "REVOKED"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Update user consent settings
    const updateData: any = {};
    
    switch (type) {
      case "DATA_RETENTION":
        updateData.dataRetentionConsent = action === "GRANTED";
        break;
      case "MARKETING":
        updateData.marketingConsent = action === "GRANTED";
        break;
      case "JOB_ALERTS":
        updateData.jobAlertConsent = action === "GRANTED";
        break;
      default:
        // For other consent types, we just log them
        break;
    }

    // Update user record if applicable
    if (Object.keys(updateData).length > 0) {
      await db.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Log consent change
    await db.consentLog.create({
      data: {
        userId,
        consentType: type,
        action: action,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId,
        action: `CONSENT_${action}`,
        entityType: "USER",
        entityId: userId,
        changes: JSON.stringify({
          consentType: type,
          action: action,
          timestamp: new Date().toISOString(),
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: `Consent ${action.toLowerCase()} successfully`,
      consentType: type,
      action: action,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Consent management error:", error);
    
    // Log the error for audit purposes
    try {
      await db.auditLog.create({
        data: {
          // session may be unavailable here; userId unknown
          userId: undefined,
          action: "CONSENT_UPDATE_FAILED",
          entityType: "USER",
          changes: JSON.stringify({ 
            error: error instanceof Error ? error.message : "Unknown error",
            note: "Failed during consent update; original request body not accessible in error handler"
          }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (logError) {
      console.error("Failed to log audit entry:", logError);
    }

    return NextResponse.json(
      { error: "Failed to update consent. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get current consent settings
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        dataRetentionConsent: true,
        marketingConsent: true,
        jobAlertConsent: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get consent history
    const consentLogs = await db.consentLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      currentConsents: {
        dataRetention: user.dataRetentionConsent,
        marketing: user.marketingConsent,
        jobAlerts: user.jobAlertConsent,
      },
      consentHistory: consentLogs,
    });

  } catch (error) {
    console.error("Consent retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve consent information" },
      { status: 500 }
    );
  }
}