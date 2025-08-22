import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    
    if (!session?.user?.id || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { 
      jobId, 
      paymentType, 
      planType,
      successUrl, 
      cancelUrl 
    } = await request.json();

    if (!paymentType || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Payment type, success URL, and cancel URL are required" },
        { status: 400 }
      );
    }

    // Get employer details
    const employer = await db.employer.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    let paymentAmount: number;
    let paymentDescription: string;
    let metadata: any = {
      userId,
      employerId: employer.id,
      paymentType,
    };

    // Calculate payment amount based on type
    switch (paymentType) {
      case "JOB_POSTING":
        paymentAmount = 2000; // €20.00 in cents
        paymentDescription = "Job Posting Fee - Cyprus Jobs";
        if (jobId) {
          metadata.jobId = jobId;
        }
        break;
      
      case "FEATURED_JOB":
        paymentAmount = 1500; // €15.00 in cents
        paymentDescription = "Featured Job Upgrade - Cyprus Jobs";
        if (jobId) {
          metadata.jobId = jobId;
        }
        break;
      
      case "URGENT_JOB":
        paymentAmount = 1000; // €10.00 in cents
        paymentDescription = "Urgent Job Upgrade - Cyprus Jobs";
        if (jobId) {
          metadata.jobId = jobId;
        }
        break;
      
      case "SUBSCRIPTION":
        if (!planType) {
          return NextResponse.json(
            { error: "Plan type is required for subscription payments" },
            { status: 400 }
          );
        }
        
        if (planType === "BASIC") {
          paymentAmount = 5000; // €50.00 in cents
          paymentDescription = "Basic Monthly Subscription - Cyprus Jobs";
        } else if (planType === "PREMIUM") {
          paymentAmount = 15000; // €150.00 in cents
          paymentDescription = "Premium Monthly Subscription - Cyprus Jobs";
        } else {
          return NextResponse.json(
            { error: "Invalid subscription plan type" },
            { status: 400 }
          );
        }
        
        metadata.planType = planType;
        break;
      
      default:
        return NextResponse.json(
          { error: "Invalid payment type" },
          { status: 400 }
        );
    }

    // Create or get Stripe customer
    let stripeCustomer;
    // Always create (or search by email) a stripe customer since local schema
    // does not persist stripeCustomerId field. In production you'd store it.
    const existingCustomers = await stripe.customers.list({ email: employer.user.email!, limit: 1 });
    stripeCustomer = existingCustomers.data[0] ?? await stripe.customers.create({
      email: employer.user.email!,
      name: employer.companyName || employer.user.name!,
      metadata: { employerId: employer.id, userId }
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: 'eur',
      customer: stripeCustomer.id,
      description: paymentDescription,
      metadata: metadata,
      payment_method_types: ['card', 'sepa_debit'],
    });

    // Create payment record in database
    const payment = await db.payment.create({
      data: {
        employerId: employer.id,
        jobId: jobId || null,
        amount: paymentAmount,
        currency: 'eur',
        status: 'PENDING',
        type: paymentType,
        stripePaymentIntentId: paymentIntent.id,
  stripeCustomerId: null, // Not stored on user model currently
        planType: planType || null,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: paymentAmount,
      currency: 'eur',
      paymentType,
      description: paymentDescription,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    
    // Log the error for audit purposes
    try {
      await db.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: "PAYMENT_CREATION_FAILED",
          entityType: "PAYMENT",
          changes: JSON.stringify({ 
            error: error instanceof Error ? error.message : "Unknown error",
          }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (logError) {
      console.error("Failed to log audit entry:", logError);
    }

    return NextResponse.json(
      { error: "Failed to create payment. Please try again later." },
      { status: 500 }
    );
  }
}