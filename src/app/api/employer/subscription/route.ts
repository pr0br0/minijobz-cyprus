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

    // Get employer profile
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

    // Get current subscription
    const subscription = await db.subscription.findFirst({
      where: {
        employerId: employer.id,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      return NextResponse.json(null);
    }

    // Transform the response
    const transformedSubscription = {
      id: subscription.id,
      status: subscription.status,
      plan: subscription.plan,
      startsAt: subscription.startsAt.toISOString(),
      endsAt: subscription.endsAt.toISOString(),
      cancelledAt: subscription.cancelledAt?.toISOString(),
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    };

    return NextResponse.json(transformedSubscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Get employer profile
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

    // Define plan details
    const plans = {
      basic: {
        plan: "BASIC" as const,
        name: "Basic Plan",
        price: 50,
        currency: "EUR",
        interval: "MONTHLY",
      },
      premium: {
        plan: "PREMIUM" as const,
        name: "Premium Plan", 
        price: 150,
        currency: "EUR",
        interval: "MONTHLY",
      },
    };

    const plan = plans[planId as keyof typeof plans];
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan ID" },
        { status: 400 }
      );
    }

    // Check if there's an existing active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        employerId: employer.id,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      // If upgrading/downgrading, we would handle that here
      // For now, we'll just return an error
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // In a real implementation, you would integrate with Stripe here
    // For now, we'll create a mock subscription
    
    // Calculate subscription period
    const now = new Date();
    const startsAt = now;
    const endsAt = new Date(now.setMonth(now.getMonth() + 1)); // 1 month from now

    // Create the subscription
    const subscription = await db.subscription.create({
      data: {
        employerId: employer.id,
        stripeSubscriptionId: `mock_${Date.now()}`, // In real implementation, this would come from Stripe
        plan: plan.plan,
        startsAt,
        endsAt,
      },
    });

    // Log the subscription creation for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SUBSCRIPTION_CREATED",
        entityType: "Subscription",
        entityId: subscription.id,
        changes: JSON.stringify({
          plan: plan.plan,
          price: plan.price,
          currency: plan.currency,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // In a real implementation, you would:
    // 1. Create a Stripe checkout session
    // 2. Return the checkout URL to redirect the user
    // For now, we'll just return success

    return NextResponse.json({
      message: "Subscription created successfully",
      subscriptionId: subscription.id,
      // checkoutUrl: "https://checkout.stripe.com/...", // Real implementation would return this
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get employer profile
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

    // Get active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        employerId: employer.id,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel the subscription (set cancelledAt timestamp)
    const updatedSubscription = await db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        cancelledAt: new Date(),
      },
    });

    // Log the cancellation for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SUBSCRIPTION_CANCELLED",
        entityType: "Subscription",
        entityId: subscription.id,
        changes: JSON.stringify({
          plan: subscription.plan,
          cancelledAt: updatedSubscription.cancelledAt,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Subscription cancelled successfully",
      willCancelAt: updatedSubscription.endsAt.toISOString(),
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}