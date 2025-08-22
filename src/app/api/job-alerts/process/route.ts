import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NotificationService } from "@/lib/notificationService";
// Removed incorrect enum imports; using string literals where needed

// This endpoint would be called by a cron job to process job alerts and send notifications
export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    
    // Simple secret key to prevent unauthorized access
    if (secret !== process.env.JOB_ALERT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting job alert processing...");

    // Get all active job alerts
    const activeAlerts = await db.jobAlert.findMany({
      where: {
        active: true,
        jobSeeker: {
          user: {
            jobAlertConsent: true, // Only process if user has consented
          },
        },
      },
      include: {
        jobSeeker: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`Found ${activeAlerts.length} active job alerts to process`);

    let totalNotificationsSent = 0;
    let alertsProcessed = 0;

    for (const alert of activeAlerts) {
      try {
        const notificationsSent = await processSingleAlert(alert);
        totalNotificationsSent += notificationsSent;
        alertsProcessed++;
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }

    console.log(`Job alert processing completed. Processed ${alertsProcessed} alerts, sent ${totalNotificationsSent} notifications`);

    return NextResponse.json({
      message: "Job alert processing completed",
      alertsProcessed,
      notificationsSent: totalNotificationsSent,
    });

  } catch (error) {
    console.error("Job alert processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function processSingleAlert(alert: any): Promise<number> {
  // Build job search query based on alert criteria
  const where: any = {
    status: "PUBLISHED",
    // Don't send alerts for jobs older than 7 days
    publishedAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  };

  // Add location filter if specified
  if (alert.location) {
    where.location = {
      contains: alert.location,
      mode: 'insensitive',
    };
  }

  // Add job type filter if specified
  if (alert.jobType) {
    where.type = alert.jobType;
  }

  // Add salary range filters if specified
  if (alert.salaryMin || alert.salaryMax) {
    where.OR = [];
    
    if (alert.salaryMin && alert.salaryMax) {
      where.OR.push(
        {
          AND: [
            { salaryMin: { gte: alert.salaryMin } },
            { salaryMax: { lte: alert.salaryMax } },
          ],
        },
        {
          AND: [
            { salaryMin: { gte: alert.salaryMin } },
            { salaryMax: null },
          ],
        },
        {
          AND: [
            { salaryMin: null },
            { salaryMax: { lte: alert.salaryMax } },
          ],
        }
      );
    } else if (alert.salaryMin) {
      where.OR.push(
        {
          salaryMin: { gte: alert.salaryMin },
        },
        {
          salaryMin: null,
        }
      );
    } else if (alert.salaryMax) {
      where.OR.push(
        {
          salaryMax: { lte: alert.salaryMax },
        },
        {
          salaryMax: null,
        }
      );
    }
  }

  // Find matching jobs
  const matchingJobs = await db.job.findMany({
    where,
    include: {
      employer: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 50, // Limit to prevent overwhelming users
  });

  // Keyword-based filtering removed (keywords not part of schema); use matchingJobs directly
  const filteredJobs = matchingJobs;

  // Exclude jobs the user has already applied to
  const appliedJobs = await db.application.findMany({
    where: {
      jobSeekerId: alert.jobSeekerId,
      jobId: {
        in: filteredJobs.map(job => job.id),
      },
    },
    select: {
      jobId: true,
    },
  });

  const appliedJobIds = new Set(appliedJobs.map(app => app.jobId));
  const newJobs = filteredJobs.filter(job => !appliedJobIds.has(job.id));

  if (newJobs.length === 0) {
    return 0; // No new jobs to notify about
  }

  // Send notifications based on alert preferences
  let notificationsSent = 0;

  if (alert.emailAlerts || alert.smsAlerts) {
    const notificationData = {
      userId: alert.jobSeeker.userId,
      email: alert.jobSeeker.user.email,
      phone: alert.jobSeeker.phone,
      name: alert.jobSeeker.user.name || alert.jobSeeker.firstName,
      preferences: {
        email: alert.emailAlerts,
        sms: alert.smsAlerts,
        push: false, // Push notifications would require mobile app integration
      },
    };

    const templateData = {
      alertTitle: alert.title,
      jobs: newJobs,
      userName: alert.jobSeeker.user.name || alert.jobSeeker.firstName,
    };

    const results = await NotificationService.sendNotification(
      notificationData,
      'JOB_ALERT',
      templateData
    );

    notificationsSent = (results.email ? 1 : 0) + (results.sms ? 1 : 0);
  }

  // No lastTriggeredAt field in schema; skipping timestamp update

  // Log the notification sending
  await db.auditLog.create({
    data: {
      userId: alert.jobSeeker.userId,
      action: "JOB_ALERT_TRIGGERED",
      entityType: "JobAlert",
      entityId: alert.id,
      changes: JSON.stringify({
        jobsFound: newJobs.length,
        notificationsSent,
        alertTitle: alert.title,
      }),
      ipAddress: 'job-alert-processor',
      userAgent: 'job-alert-processor',
    },
  });

  return notificationsSent;
}

// Helper function to test job alert processing (for development)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    const secret = searchParams.get('secret');

    if (secret !== process.env.JOB_ALERT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (alertId) {
      // Test a specific alert
      const alert = await db.jobAlert.findUnique({
        where: { id: alertId },
        include: {
          jobSeeker: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!alert) {
        return NextResponse.json({ error: "Alert not found" }, { status: 404 });
      }

      const notificationsSent = await processSingleAlert(alert);
      return NextResponse.json({
        message: "Test alert processed",
        alertId,
        notificationsSent,
      });
    } else {
      // Get processing statistics
      const activeAlertsCount = await db.jobAlert.count({
        where: {
          active: true,
          jobSeeker: {
            user: {
              jobAlertConsent: true,
            },
          },
        },
      });

      const recentJobs = await db.job.count({
        where: {
          status: "PUBLISHED",
          publishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      return NextResponse.json({
        activeAlerts: activeAlertsCount,
        recentJobs,
        message: "Use POST with secret to process alerts",
      });
    }
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}