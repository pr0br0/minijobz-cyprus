import { NextResponse } from "next/server";
import { db } from "@/lib/db";
// Removed unused Prisma enum imports (using string literals now)

export async function POST() {
  try {
    console.log('🔄 Processing job alerts...');

    // Get all active job alerts
    const jobAlerts = await db.jobAlert.findMany({
      where: {
        active: true,
      },
      include: {
        jobSeeker: {
          include: {
            user: true,
            skills: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });

    if (jobAlerts.length === 0) {
      console.log('No active job alerts found');
      return NextResponse.json({
        success: true,
        message: "No active job alerts to process",
        processed: 0,
        notificationsSent: 0
      });
    }

    let totalNotificationsSent = 0;
    const processedAlerts = [];

    // Get recent jobs (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentJobs = await db.job.findMany({
      where: {
  status: 'PUBLISHED',
        createdAt: { gte: oneDayAgo },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      include: {
        employer: {
          include: {
            company: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${recentJobs.length} recent jobs to check against ${jobAlerts.length} job alerts`);

    // Process each job alert
    for (const alert of jobAlerts) {
      const matchingJobs = recentJobs.filter(job => {
        // Check if job matches alert criteria
        let matches = true;

        // Title filter
        if (alert.title && !job.title.toLowerCase().includes(alert.title.toLowerCase())) {
          matches = false;
        }

        // Location filter
        if (alert.location && !job.location.toLowerCase().includes(alert.location.toLowerCase())) {
          matches = false;
        }

        // Industry filter (check in company description or job description)
        if (alert.industry) {
          const industryMatch = 
            (job.employer.company?.description?.toLowerCase().includes(alert.industry.toLowerCase()) ||
             job.description.toLowerCase().includes(alert.industry.toLowerCase()) ||
             job.employer.industry?.toLowerCase().includes(alert.industry.toLowerCase()));
          
          if (!industryMatch) {
            matches = false;
          }
        }

        // Job type filter
        if (alert.jobType && job.type !== alert.jobType) {
          matches = false;
        }

        // Salary range filter
        if (alert.salaryMin && job.salaryMax && job.salaryMax < alert.salaryMin) {
          matches = false;
        }
        if (alert.salaryMax && job.salaryMin && job.salaryMin > alert.salaryMax) {
          matches = false;
        }

        // Skill matching (boost score for jobs with matching skills)
        if (alert.jobSeeker.skills.length > 0) {
          const userSkills = alert.jobSeeker.skills.map(js => js.skill.name.toLowerCase());
          const jobSkills = job.skills.map(js => js.skill.name.toLowerCase());
          
          const skillMatches = userSkills.filter(skill => 
            jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
          );
          
          // If user has skills but no matches, reduce priority
          if (userSkills.length > 0 && skillMatches.length === 0) {
            matches = false;
          }
        }

        return matches;
      });

      if (matchingJobs.length > 0) {
        console.log(`Found ${matchingJobs.length} matching jobs for alert ${alert.id}`);

        // Send notifications based on alert preferences
        const notificationPromises = [];

        if (alert.emailAlerts) {
          notificationPromises.push(
            sendJobAlertEmail(alert, matchingJobs)
          );
        }

        if (alert.smsAlerts) {
          notificationPromises.push(
            sendJobAlertSMS(alert, matchingJobs)
          );
        }

        const results = await Promise.allSettled(notificationPromises);
        const sentCount = results.filter(result => result.status === 'fulfilled').length;
        totalNotificationsSent += sentCount;

        processedAlerts.push({
          alertId: alert.id,
          jobSeekerEmail: alert.jobSeeker.user.email,
          matchingJobsCount: matchingJobs.length,
          notificationsSent: sentCount
        });
      }
    }

    console.log(`✅ Job alert processing completed. Sent ${totalNotificationsSent} notifications`);

    return NextResponse.json({
      success: true,
      message: "Job alerts processed successfully",
      processed: jobAlerts.length,
      notificationsSent: totalNotificationsSent,
      details: processedAlerts
    });

  } catch (error) {
    console.error("Error processing job alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendJobAlertEmail(alert: any, matchingJobs: any[]) {
  const jobSeeker = alert.jobSeeker;
  const user = jobSeeker.user;

  // Create personalized email content
  const subject = `New Job Matches on Cyprus Jobs - ${matchingJobs.length} positions found`;
  
  const emailContent = `
Hello ${jobSeeker.firstName},

Great news! We found ${matchingJobs.length} new job opportunities that match your preferences:

${matchingJobs.map((job, index) => `
${index + 1}. ${job.title} at ${job.employer.companyName}
   Location: ${job.location}
   Type: ${job.type.replace('_', ' ')}
   ${job.salaryMin && job.salaryMax ? `Salary: €${job.salaryMin.toLocaleString()} - €${job.salaryMax.toLocaleString()}` : ''}
   ${job.featured ? '⭐ Featured Job' : ''}
   ${job.urgent ? '🔥 Urgent' : ''}
   
   View details: https://cyprusjobs.com/jobs/${job.id}
`).join('\n')}

Why these jobs match you:
${getMatchReasons(alert, matchingJobs)}

You can manage your job alert preferences here: https://cyprusjobs.com/dashboard/job-seeker/alerts

Best regards,
The Cyprus Jobs Team

---
You're receiving this email because you subscribed to job alerts on Cyprus Jobs.
To unsubscribe, please visit your dashboard: https://cyprusjobs.com/dashboard/job-seeker/alerts
  `;

  // Send email notification
  const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'EMAIL',
      recipient: user.email,
      subject: subject,
      message: emailContent,
      template: 'JOB_ALERT',
      data: {
        jobSeekerName: jobSeeker.firstName,
        matchingJobsCount: matchingJobs.length,
        jobs: matchingJobs,
        alertFrequency: alert.frequency
      }
    }),
  });

  if (!notificationResponse.ok) {
    throw new Error('Failed to send email notification');
  }

  return await notificationResponse.json();
}

async function sendJobAlertSMS(alert: any, matchingJobs: any[]) {
  const jobSeeker = alert.jobSeeker;
  const user = jobSeeker.user;

  // Create SMS content (shorter version)
  const topJob = matchingJobs[0];
  const smsContent = `Cyprus Jobs: ${matchingJobs.length} new jobs match your alert! Top match: ${topJob.title} at ${topJob.employer.companyName} in ${topJob.location}. View all: https://cyprusjobs.com/jobs`;

  // Send SMS notification
  const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'SMS',
      recipient: jobSeeker.phone || user.email, // Fallback to email if no phone
      message: smsContent,
      template: 'JOB_ALERT_SMS',
      data: {
        jobSeekerName: jobSeeker.firstName,
        matchingJobsCount: matchingJobs.length,
        topJob: topJob
      }
    }),
  });

  if (!notificationResponse.ok) {
    throw new Error('Failed to send SMS notification');
  }

  return await notificationResponse.json();
}

function getMatchReasons(alert: any, matchingJobs: any[]): string {
  const reasons = [];
  
  if (alert.title) {
    reasons.push(`• Title matches "${alert.title}"`);
  }
  
  if (alert.location) {
    reasons.push(`• Location preference for "${alert.location}"`);
  }
  
  if (alert.industry) {
    reasons.push(`• Industry interest in "${alert.industry}"`);
  }
  
  if (alert.jobType) {
    reasons.push(`• Job type preference for "${alert.jobType.replace('_', ' ')}"`);
  }
  
  if (alert.salaryMin || alert.salaryMax) {
    reasons.push(`• Salary range preferences`);
  }
  
  if (alert.jobSeeker.skills.length > 0) {
    reasons.push(`• Your skills match job requirements`);
  }
  
  return reasons.join('\n');
}