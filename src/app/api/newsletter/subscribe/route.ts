import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, preferences } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return NextResponse.json(
          { error: "This email is already subscribed to our newsletter" },
          { status: 409 }
        );
      } else {
        // Reactivate existing subscription
        await db.newsletterSubscriber.update({
          where: { email },
          data: {
            active: true,
            subscribedAt: new Date(),
            name: name || existingSubscriber.name,
            preferences: preferences ? JSON.stringify(preferences) : existingSubscriber.preferences,
          },
        });

        return NextResponse.json({
          message: "Welcome back! Your subscription has been reactivated.",
          email,
        });
      }
    }

    // Create new subscriber
    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
        preferences: preferences ? JSON.stringify(preferences) : null,
        subscribedAt: new Date(),
        active: true,
      },
    });

    // Log the subscription for audit trail
    await db.auditLog.create({
      data: {
        userId: null, // Anonymous subscription
        action: "NEWSLETTER_SUBSCRIBED",
        entityType: "NewsletterSubscriber",
        entityId: subscriber.id,
        changes: JSON.stringify({
          email,
          name,
          preferences,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Successfully subscribed to our newsletter!",
      email,
      subscriberId: subscriber.id,
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}