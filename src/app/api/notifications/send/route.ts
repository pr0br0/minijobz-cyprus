import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface NotificationRequest {
  type: 'EMAIL' | 'SMS';
  recipient: string;
  subject?: string;
  message: string;
  template?: string;
  data?: Record<string, any>;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only allow admin users to send notifications
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body: NotificationRequest = await request.json();
    const { type, recipient, subject, message, template, data } = body;

    // Validate required fields
    if (!type || !recipient || !message) {
      return NextResponse.json(
        { error: "Missing required fields: type, recipient, message" },
        { status: 400 }
      );
    }

    // Log the notification for audit purposes
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SEND_NOTIFICATION',
        entityType: 'Notification',
        changes: JSON.stringify({
          type,
          recipient,
          subject,
          message: message.substring(0, 100) + '...',
          template
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // Send notification based on type
    let result;
    
    if (type === 'EMAIL') {
      result = await sendEmailNotification(recipient, subject || 'Cyprus Jobs Notification', message, template, data);
    } else if (type === 'SMS') {
      result = await sendSMSNotification(recipient, message, data);
    } else {
      return NextResponse.json(
        { error: "Invalid notification type. Must be 'EMAIL' or 'SMS'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      result
    });

  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendEmailNotification(
  email: string, 
  subject: string, 
  message: string, 
  template?: string, 
  data?: Record<string, any>
) {
  // In a real implementation, you would integrate with an email service like:
  // - SendGrid
  // - AWS SES
  // - Mailgun
  // - Nodemailer with SMTP
  
  console.log(`📧 Email Notification:`);
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Template: ${template || 'default'}`);
  console.log(`Data:`, data);
  console.log(`Message: ${message}`);

  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    id: `email_${Date.now()}`,
    type: 'EMAIL',
    recipient: email,
    status: 'sent',
    timestamp: new Date().toISOString()
  };
}

async function sendSMSNotification(
  phone: string, 
  message: string, 
  data?: Record<string, any>
) {
  // In a real implementation, you would integrate with an SMS service like:
  // - Twilio
  // - AWS SNS
  // - Vonage (Nexmo)
  
  console.log(`📱 SMS Notification:`);
  console.log(`To: ${phone}`);
  console.log(`Message: ${message}`);
  console.log(`Data:`, data);

  // Simulate SMS sending
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    id: `sms_${Date.now()}`,
    type: 'SMS',
    recipient: phone,
    status: 'sent',
    timestamp: new Date().toISOString()
  };
}