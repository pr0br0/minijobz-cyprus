import { NextRequest, NextResponse } from "next/server";
// Removed legacy UserRoleEnum import
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
    const { action, planId } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
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

    // Get current subscription
    const currentSubscription = await db.subscription.findFirst({
      where: {
        employerId: employer.id,
  status: 'ACTIVE',
      },
    });

    switch (action) {
      case "upgrade":
      case "downgrade":
        if (!planId) {
          return NextResponse.json(
            { error: "Plan ID is required for upgrade/downgrade" },
            { status: 400 }
          );
        }
        
        if (!currentSubscription) {
          return NextResponse.json(
            { error: "No active subscription found" },
            { status: 404 }
          );
        }

        return await handlePlanChange(currentSubscription, planId, action, request);

      case "cancel":
        if (!currentSubscription) {
          return NextResponse.json(
            { error: "No active subscription found" },
            { status: 404 }
          );
        }

        return await handleCancellation(currentSubscription, request);

      case "resume":
        if (!currentSubscription) {
          return NextResponse.json(
            { error: "No subscription found" },
            { status: 404 }
          );
        }

        return await handleResumption(currentSubscription, request);

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Subscription management error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handlePlanChange(
  currentSubscription: any,
  newPlanId: string,
  action: string,
  request: NextRequest
) {
  // Validate plan
  const validPlans = ['BASIC','PREMIUM'];
  if (!validPlans.includes(newPlanId)) {
    return NextResponse.json(
      { error: "Invalid plan ID" },
      { status: 400 }
    );
  }

  const newPlan = newPlanId as 'BASIC'|'PREMIUM';
  const currentPlan = currentSubscription.plan;

  // Don't allow "upgrade" to the same plan
  if (currentPlan === newPlan) {
    return NextResponse.json(
      { error: "You are already on this plan" },
      { status: 400 }
    );
  }

  // Define plan hierarchy and pricing
  const planHierarchy: Record<'BASIC'|'PREMIUM',number> = { BASIC:1, PREMIUM:2 };

  const planPrices: Record<'BASIC'|'PREMIUM',number> = { BASIC:50, PREMIUM:150 };

  const currentLevel = planHierarchy[currentPlan];
  const newLevel = planHierarchy[newPlan];

  // Validate action matches plan hierarchy
  if (action === "upgrade" && newLevel <= currentLevel) {
    return NextResponse.json(
      { error: "Invalid upgrade path" },
      { status: 400 }
    );
  }

  if (action === "downgrade" && newLevel >= currentLevel) {
    return NextResponse.json(
      { error: "Invalid downgrade path" },
      { status: 400 }
    );
  }

  // Calculate prorated amount and new end date
  const now = new Date();
  const currentEndsAt = new Date(currentSubscription.endsAt);
  const daysRemaining = Math.ceil((currentEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const currentPrice = planPrices[currentPlan];
  const newPrice = planPrices[newPlan];
  const dailyRate = currentPrice / 30;
  const proratedRefund = Math.max(0, dailyRate * daysRemaining);
  const additionalAmount = Math.max(0, newPrice - proratedRefund);

  // In a real implementation, you would:
  // 1. Create a Stripe payment intent for the additional amount (if upgrading)
  // 2. Process the payment
  // 3. Update the subscription in Stripe
  // 4. Update the local database

  // For now, we'll simulate the plan change
  const updatedSubscription = await db.subscription.update({
    where: { id: currentSubscription.id },
    data: {
      plan: newPlan,
      // In a real implementation, you might extend the subscription period
      // or adjust the billing date based on the prorated amount
    },
  });

  // Log the plan change
  await db.auditLog.create({
    data: {
  userId: currentSubscription.employerId,
      action: `SUBSCRIPTION_${action.toUpperCase()}`,
      entityType: "Subscription",
      entityId: currentSubscription.id,
      changes: JSON.stringify({
        fromPlan: currentPlan,
        toPlan: newPlan,
        proratedRefund,
        additionalAmount,
      }),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    },
  });

  return NextResponse.json({
    message: `Subscription ${action}d successfully`,
    subscription: {
      id: updatedSubscription.id,
      plan: updatedSubscription.plan,
      status: updatedSubscription.status,
      startsAt: updatedSubscription.startsAt.toISOString(),
      endsAt: updatedSubscription.endsAt.toISOString(),
    },
    billing: {
      additionalAmount,
      proratedRefund,
      effectiveImmediately: true,
    },
  });
}

async function handleCancellation(
  subscription: any,
  request: NextRequest
) {
  // Check if already cancelled
  if (subscription.cancelledAt) {
    return NextResponse.json(
      { error: "Subscription is already cancelled" },
      { status: 400 }
    );
  }

  // Set cancellation date
  const updatedSubscription = await db.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelledAt: new Date(),
  status: 'CANCELLED',
    },
  });

  // Log the cancellation
  await db.auditLog.create({
    data: {
  userId: subscription.employerId,
      action: "SUBSCRIPTION_CANCELLED",
      entityType: "Subscription",
      entityId: subscription.id,
      changes: JSON.stringify({
        plan: subscription.plan,
        cancelledAt: updatedSubscription.cancelledAt,
        accessUntil: updatedSubscription.endsAt,
      }),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    },
  });

  return NextResponse.json({
    message: "Subscription cancelled successfully",
    accessUntil: updatedSubscription.endsAt.toISOString(),
    immediateRefund: false, // In a real implementation, this would depend on your refund policy
  });
}

async function handleResumption(
  subscription: any,
  request: NextRequest
) {
  // Check if subscription can be resumed
  if (!subscription.cancelledAt) {
    return NextResponse.json(
      { error: "Subscription is not cancelled" },
      { status: 400 }
    );
  }

  // Check if subscription period has already ended
  if (new Date() > new Date(subscription.endsAt)) {
    return NextResponse.json(
      { error: "Subscription period has ended. Please purchase a new subscription." },
      { status: 400 }
    );
  }

  // Resume the subscription
  const updatedSubscription = await db.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelledAt: null,
  status: 'ACTIVE',
    },
  });

  // Log the resumption
  await db.auditLog.create({
    data: {
  userId: subscription.employerId,
      action: "SUBSCRIPTION_RESUMED",
      entityType: "Subscription",
      entityId: subscription.id,
      changes: JSON.stringify({
        plan: subscription.plan,
        resumedAt: new Date().toISOString(),
      }),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    },
  });

  return NextResponse.json({
    message: "Subscription resumed successfully",
    subscription: {
      id: updatedSubscription.id,
      plan: updatedSubscription.plan,
      status: updatedSubscription.status,
      endsAt: updatedSubscription.endsAt.toISOString(),
    },
  });
}

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
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Get all subscriptions (current and historical)
    const subscriptions = await db.subscription.findMany({
      where: {
        employerId: employer.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Last 10 subscriptions
    });

    // Get subscription usage statistics
  const activeSubscription = subscriptions.find(s => s.status === 'ACTIVE');
    
    let usageStats = {
      totalJobsPosted: 0,
      activeJobsPosted: 0,
      featuredJobsUsed: 0,
      urgentJobsUsed: 0,
      applicationsReceived: 0,
    };

    if (activeSubscription) {
      const jobs = await db.job.findMany({
        where: {
          employerId: employer.id,
          createdAt: {
            gte: activeSubscription.startsAt,
          },
        },
        include: {
          _count: {
            select: { applications: true }
          }
        }
      });

      const activeJobs = jobs.filter(job => 
        job.status === "PUBLISHED" && 
        (!job.expiresAt || new Date(job.expiresAt) > new Date())
      );

      usageStats = {
        totalJobsPosted: jobs.length,
        activeJobsPosted: activeJobs.length,
        featuredJobsUsed: jobs.filter(job => job.featured).length,
        urgentJobsUsed: jobs.filter(job => job.urgent).length,
        applicationsReceived: jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0),
      };
    }

    return NextResponse.json({
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        plan: sub.plan,
        status: sub.status,
        startsAt: sub.startsAt.toISOString(),
        endsAt: sub.endsAt.toISOString(),
        cancelledAt: sub.cancelledAt?.toISOString(),
        stripeSubscriptionId: sub.stripeSubscriptionId,
      })),
      usageStats,
      currentPlan: activeSubscription?.plan || null,
    });

  } catch (error) {
    console.error("Error fetching subscription details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}