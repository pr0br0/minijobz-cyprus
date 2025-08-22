import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment record
    const existing = await db.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });
    if (!existing) {
      console.error('Payment not found for Stripe payment intent:', paymentIntent.id);
      return;
    }
    const payment = await db.payment.update({
      where: { id: existing.id },
      data: { status: 'COMPLETED' }
    });

    // Handle different payment types
    switch (payment.type) {
      case 'JOB_POSTING':
        await handleJobPostingPayment(payment);
        break;
      
      case 'FEATURED_JOB':
        await handleFeaturedJobPayment(payment);
        break;
      
      case 'URGENT_JOB':
        await handleUrgentJobPayment(payment);
        break;
      
      case 'SUBSCRIPTION':
        await handleSubscriptionPayment(payment);
        break;
    }

    // Log successful payment
    await db.auditLog.create({
      data: {
        userId: payment.employerId,
        action: 'PAYMENT_SUCCESS',
        entityType: 'PAYMENT',
        entityId: payment.id,
        changes: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paymentType: payment.type,
        }),
        ipAddress: 'stripe-webhook',
        userAgent: 'stripe-webhook',
      },
    });

    console.log('Payment processed successfully:', payment.id);

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
  const existing = await db.payment.findFirst({ where: { stripePaymentIntentId: paymentIntent.id } });
  if (!existing) return;
  await db.payment.update({ where: { id: existing.id }, data: { status: 'FAILED' } });

    // Log failed payment
    await db.auditLog.create({
      data: {
        action: 'PAYMENT_FAILED',
        entityType: 'PAYMENT',
        changes: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          failureReason: paymentIntent.last_payment_error?.message || 'Unknown',
        }),
        ipAddress: 'stripe-webhook',
        userAgent: 'stripe-webhook',
      },
    });

    console.log('Payment failed:', paymentIntent.id);

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
  const existing = await db.payment.findFirst({ where: { stripePaymentIntentId: paymentIntent.id } });
  if (!existing) return;
  await db.payment.update({ where: { id: existing.id }, data: { status: 'CANCELLED' } });

    // Log canceled payment
    await db.auditLog.create({
      data: {
        action: 'PAYMENT_CANCELLED',
        entityType: 'PAYMENT',
        changes: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        }),
        ipAddress: 'stripe-webhook',
        userAgent: 'stripe-webhook',
      },
    });

    console.log('Payment canceled:', paymentIntent.id);

  } catch (error) {
    console.error('Error handling payment intent canceled:', error);
  }
}

async function handleJobPostingPayment(payment: any) {
  if (!payment.jobId) {
    console.error('Job ID not found for job posting payment:', payment.id);
    return;
  }

  // Publish the job
  await db.job.update({
    where: { id: payment.jobId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });
}

async function handleFeaturedJobPayment(payment: any) {
  if (!payment.jobId) {
    console.error('Job ID not found for featured job payment:', payment.id);
    return;
  }

  // Mark job as featured
  await db.job.update({
    where: { id: payment.jobId },
    data: {
      featured: true,
    },
  });
}

async function handleUrgentJobPayment(payment: any) {
  if (!payment.jobId) {
    console.error('Job ID not found for urgent job payment:', payment.id);
    return;
  }

  // Mark job as urgent
  await db.job.update({
    where: { id: payment.jobId },
    data: {
      urgent: true,
    },
  });
}

async function handleSubscriptionPayment(payment: any) {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  // Create or update subscription
  await db.subscription.upsert({
    where: {
      // Upsert requires a unique field; employerId is unique via relation? we use composite uniqueness by creating a deterministic id if needed
      id: payment.subscriptionId || payment.employerId,
    },
    update: {
      plan: payment.planType,
      status: 'ACTIVE',
      startsAt: startDate,
      endsAt: endDate,
      stripeSubscriptionId: payment.stripePaymentIntentId, // This would be different for real subscriptions
  // stripeCustomerId not persisted on current Payment schema's related user
  stripeCustomerId: null,
    },
    create: {
      id: payment.subscriptionId || payment.employerId, // ensure deterministic id for upsert
      employerId: payment.employerId,
      plan: payment.planType,
      status: 'ACTIVE',
      startsAt: startDate,
      endsAt: endDate,
      stripeSubscriptionId: payment.stripePaymentIntentId,
      stripeCustomerId: null,
    },
  });
}