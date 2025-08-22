import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // Get payments for this employer
    const payments = await db.payment.findMany({
      where: {
        employerId: employer.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 payments
    });

    // Transform the response
    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
      stripePaymentIntentId: payment.stripePaymentIntentId,
    }));

    return NextResponse.json({
      payments: transformedPayments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
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
    const { amount, paymentMethodId, type } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
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

    // In a real implementation, you would process the payment with Stripe here
    // For now, we'll create a mock payment record

    const payment = await db.payment.create({
      data: {
        employerId: employer.id,
        amount: parseInt(amount, 10),
        currency: "EUR", // Default to EUR for Cyprus
        status: 'COMPLETED', // Mock successful payment aligned with enum
        stripePaymentIntentId: `pi_${Date.now()}`, // Mock Stripe payment intent ID
        type: type || 'JOB_POSTING',
      },
    });

    // Log the payment for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PAYMENT_PROCESSED",
        entityType: "Payment",
        entityId: payment.id,
        changes: JSON.stringify({
          amount: payment.amount,
          currency: payment.currency,
          type: payment.type,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Payment processed successfully",
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}