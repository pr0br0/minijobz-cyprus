import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get recent activities from different sources
    const [
      recentJobs,
      recentApplications,
      recentUsers,
      recentPayments
    ] = await Promise.all([
      // Recent job postings
      db.job.findMany({
        where: {
          createdAt: { gte: last24Hours },
          status: 'PUBLISHED'
        },
        include: {
          employer: {
            select: {
              companyName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      
      // Recent applications
      db.application.findMany({
        where: {
          appliedAt: { gte: last24Hours }
        },
        include: {
          job: {
            select: {
              title: true,
              employer: {
                select: {
                  companyName: true
                }
              }
            }
          },
          jobSeeker: {
            select: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          appliedAt: 'desc'
        },
        take: 5
      }),
      
      // Recent user registrations
      db.user.findMany({
        where: {
          createdAt: { gte: last24Hours }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      
      // Recent payments
      db.payment.findMany({
        where: {
          createdAt: { gte: last24Hours },
          status: 'COMPLETED'
        },
        include: {
          employer: {
            select: {
              companyName: true,
              user: { select: { name: true, email: true } }
            }
          },
          job: { select: { id: true, title: true } }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      })
    ]);

    // Transform data into activity format
    const activities: any[] = [];

    // Add job postings
    recentJobs.forEach(job => {
      activities.push({
        id: uuidv4(),
        type: 'job_posted',
        message: `New job posted: ${job.title} at ${job.employer.companyName}`,
        timestamp: job.createdAt.toISOString(),
        details: {
          jobId: job.id,
          title: job.title,
          company: job.employer.companyName,
          location: job.location,
          type: job.type
        }
      });
    });

    // Add applications
    recentApplications.forEach(application => {
      activities.push({
        id: uuidv4(),
        type: 'application_submitted',
        message: `${application.jobSeeker?.user?.name || 'Anonymous'} applied for ${application.job.title}`,
        timestamp: application.appliedAt.toISOString(),
        details: {
          applicationId: application.id,
          jobTitle: application.job.title,
          company: application.job.employer.companyName,
          status: application.status
        }
      });
    });

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: uuidv4(),
        type: 'user_registered',
        message: `New user registered: ${user.name || user.email}`,
        timestamp: user.createdAt.toISOString(),
        details: {
          userId: user.id,
          email: user.email,
          role: user.role
        }
      });
    });

    // Add payments
    recentPayments.forEach(payment => {
      activities.push({
        id: uuidv4(),
        type: 'payment_received',
        message: `Payment received from ${payment.employer?.user?.name || payment.employer?.user?.email || payment.employer?.companyName}`,
        timestamp: payment.createdAt.toISOString(),
        details: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          company: payment.employer?.companyName,
          type: payment.type
        }
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 20), // Return last 20 activities
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}