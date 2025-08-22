import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const { format = "json" } = await request.json();

    // Collect user data based on role
    const userData: any = {};

    // Basic user information
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        dataRetentionConsent: true,
        marketingConsent: true,
        jobAlertConsent: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    userData.basicInfo = user;

    // Role-specific data
    if (userRole === "JOB_SEEKER") {
      const jobSeeker = await db.jobSeeker.findUnique({
        where: { userId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          applications: {
            include: {
              job: {
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
              },
            },
          },
          jobAlerts: true,
          savedJobs: {
            include: {
              job: {
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
              },
            },
          },
        },
      });

      if (jobSeeker) {
        userData.jobSeekerProfile = {
          ...jobSeeker,
          // Remove sensitive fields if necessary
          cvUrl: jobSeeker.cvUrl ? "[CV FILE PRESENT]" : null,
        };
      }
    } else if (userRole === "EMPLOYER") {
      const employer = await db.employer.findUnique({
        where: { userId },
        include: {
          company: true,
          jobs: {
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
              applications: {
                include: {
                  jobSeeker: {
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
              },
            },
          },
          payments: true,
          subscriptions: true,
        },
      });

      if (employer) {
        userData.employerProfile = employer;
      }
    }

    // Consent logs
    const consentLogs = await db.consentLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    userData.consentLogs = consentLogs;

    // Audit logs
    const auditLogs = await db.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 entries
    });

    userData.auditLogs = auditLogs;

    // Newsletter subscriptions (if any)
    const newsletterSubscription = await db.newsletterSubscriber.findUnique({
      where: { email: user.email },
    });

    if (newsletterSubscription) {
      userData.newsletterSubscription = newsletterSubscription;
    }

    // Generate export metadata
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: userId,
      userEmail: user.email,
      dataSummary: {
        basicInfo: !!userData.basicInfo,
        jobSeekerProfile: !!userData.jobSeekerProfile,
        employerProfile: !!userData.employerProfile,
        consentLogs: userData.consentLogs.length,
        auditLogs: userData.auditLogs.length,
        newsletterSubscription: !!userData.newsletterSubscription,
      },
      data: userData,
    };

    // Log this data export for audit purposes
    await db.auditLog.create({
      data: {
        userId,
        action: "DATA_EXPORT",
        entityType: "USER",
        entityId: userId,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    if (format === "pdf") {
      // Generate PDF
  const pdf = await generatePDF(exportData);
  const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);
  return new NextResponse(arrayBuffer as ArrayBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="data-export-${userId}-${Date.now()}.pdf"`,
        },
      });
    } else {
      // Return JSON
      return NextResponse.json(exportData);
    }

  } catch (error) {
    console.error("Data export error:", error);
    
    // Log the error for audit purposes
    try {
      await db.auditLog.create({
        data: {
          action: "DATA_EXPORT_FAILED",
          entityType: "USER",
          changes: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (logError) {
      console.error("Failed to log audit entry:", logError);
    }

    return NextResponse.json(
      { error: "Failed to export data. Please try again later." },
      { status: 500 }
    );
  }
}

async function generatePDF(data: any): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Set up fonts
  doc.setFont("helvetica");
  
  // Title
  doc.setFontSize(20);
  doc.text("GDPR Data Export Report", 20, 20);
  
  // Export information
  doc.setFontSize(12);
  doc.text(`Export Date: ${new Date(data.exportedAt).toLocaleString()}`, 20, 35);
  doc.text(`User ID: ${data.userId}`, 20, 45);
  doc.text(`User Email: ${data.userEmail}`, 20, 55);
  
  let yPosition = 75;
  
  // Basic Information Section
  doc.setFontSize(16);
  doc.text("Basic Information", 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  if (data.data.basicInfo) {
    const basicInfo = data.data.basicInfo;
    doc.text(`Name: ${basicInfo.name || "N/A"}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Email: ${basicInfo.email}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Role: ${basicInfo.role}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Created: ${new Date(basicInfo.createdAt).toLocaleDateString()}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Email Verified: ${basicInfo.emailVerified ? "Yes" : "No"}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Data Retention Consent: ${basicInfo.dataRetentionConsent ? "Yes" : "No"}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Marketing Consent: ${basicInfo.marketingConsent ? "Yes" : "No"}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Job Alert Consent: ${basicInfo.jobAlertConsent ? "Yes" : "No"}`, 25, yPosition);
    yPosition += 15;
  }
  
  // Job Seeker Profile Section
  if (data.data.jobSeekerProfile) {
    doc.setFontSize(16);
    doc.text("Job Seeker Profile", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    const profile = data.data.jobSeekerProfile;
    
    if (profile.bio) {
      doc.text(`Bio: ${profile.bio}`, 25, yPosition);
      yPosition += 8;
    }
    
    if (profile.location) {
      doc.text(`Location: ${profile.location}`, 25, yPosition);
      yPosition += 8;
    }
    
    if (profile.experienceLevel) {
      doc.text(`Experience Level: ${profile.experienceLevel}`, 25, yPosition);
      yPosition += 8;
    }
    
    if (profile.website) {
      doc.text(`Website: ${profile.website}`, 25, yPosition);
      yPosition += 8;
    }
    
    if (profile.linkedin) {
      doc.text(`LinkedIn: ${profile.linkedin}`, 25, yPosition);
      yPosition += 8;
    }
    
    if (profile.cvUrl) {
      doc.text(`CV: ${profile.cvUrl}`, 25, yPosition);
      yPosition += 8;
    }
    
    // Skills
    if (profile.skills && profile.skills.length > 0) {
      doc.text("Skills:", 25, yPosition);
      yPosition += 8;
      profile.skills.forEach((skill: any, index: number) => {
        doc.text(`- ${skill.skill.name} (Level: ${skill.level})`, 30, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }
    
    // Applications
    if (profile.applications && profile.applications.length > 0) {
      doc.text(`Applications (${profile.applications.length}):`, 25, yPosition);
      yPosition += 8;
      profile.applications.slice(0, 10).forEach((app: any, index: number) => {
        doc.text(`- ${app.job.title} at ${app.job.employer.company.name} - Status: ${app.status}`, 30, yPosition);
        yPosition += 6;
      });
      if (profile.applications.length > 10) {
        doc.text(`... and ${profile.applications.length - 10} more applications`, 30, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }
    
    // Job Alerts
    if (profile.jobAlerts && profile.jobAlerts.length > 0) {
      doc.text(`Job Alerts (${profile.jobAlerts.length}):`, 25, yPosition);
      yPosition += 8;
      profile.jobAlerts.slice(0, 5).forEach((alert: any, index: number) => {
        doc.text(`- ${alert.name} - Frequency: ${alert.frequency}`, 30, yPosition);
        yPosition += 6;
      });
      if (profile.jobAlerts.length > 5) {
        doc.text(`... and ${profile.jobAlerts.length - 5} more alerts`, 30, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }
    
    yPosition += 10;
  }
  
  // Employer Profile Section
  if (data.data.employerProfile) {
    doc.setFontSize(16);
    doc.text("Employer Profile", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    const employer = data.data.employerProfile;
    
    if (employer.company) {
      doc.text(`Company: ${employer.company.name}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Industry: ${employer.company.industry}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Size: ${employer.company.size}`, 25, yPosition);
      yPosition += 8;
      doc.text(`Website: ${employer.company.website}`, 25, yPosition);
      yPosition += 8;
    }
    
    // Jobs
    if (employer.jobs && employer.jobs.length > 0) {
      doc.text(`Jobs Posted (${employer.jobs.length}):`, 25, yPosition);
      yPosition += 8;
      employer.jobs.slice(0, 10).forEach((job: any, index: number) => {
        doc.text(`- ${job.title} - Status: ${job.status}`, 30, yPosition);
        yPosition += 6;
      });
      if (employer.jobs.length > 10) {
        doc.text(`... and ${employer.jobs.length - 10} more jobs`, 30, yPosition);
        yPosition += 6;
      }
      yPosition += 5;
    }
    
    yPosition += 10;
  }
  
  // Consent Logs
  if (data.data.consentLogs && data.data.consentLogs.length > 0) {
    doc.setFontSize(16);
    doc.text("Consent Logs", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Total Consent Entries: ${data.data.consentLogs.length}`, 25, yPosition);
    yPosition += 8;
    
    data.data.consentLogs.slice(0, 5).forEach((log: any, index: number) => {
      doc.text(`- ${log.consentType} - ${new Date(log.createdAt).toLocaleDateString()}`, 30, yPosition);
      yPosition += 6;
    });
    if (data.data.consentLogs.length > 5) {
      doc.text(`... and ${data.data.consentLogs.length - 5} more entries`, 30, yPosition);
      yPosition += 6;
    }
    yPosition += 10;
  }
  
  // Audit Logs
  if (data.data.auditLogs && data.data.auditLogs.length > 0) {
    doc.setFontSize(16);
    doc.text("Audit Logs", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Total Audit Entries: ${data.data.auditLogs.length}`, 25, yPosition);
    yPosition += 8;
    
    data.data.auditLogs.slice(0, 5).forEach((log: any, index: number) => {
      doc.text(`- ${log.action} - ${new Date(log.createdAt).toLocaleDateString()}`, 30, yPosition);
      yPosition += 6;
    });
    if (data.data.auditLogs.length > 5) {
      doc.text(`... and ${data.data.auditLogs.length - 5} more entries`, 30, yPosition);
      yPosition += 6;
    }
    yPosition += 10;
  }
  
  // Newsletter Subscription
  if (data.data.newsletterSubscription) {
    doc.setFontSize(16);
    doc.text("Newsletter Subscription", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    const newsletter = data.data.newsletterSubscription;
    doc.text(`Email: ${newsletter.email}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Status: ${newsletter.status}`, 25, yPosition);
    yPosition += 8;
    doc.text(`Subscribed: ${new Date(newsletter.createdAt).toLocaleDateString()}`, 25, yPosition);
    yPosition += 8;
    if (newsletter.preferences) {
      doc.text(`Preferences: ${newsletter.preferences.join(", ")}`, 25, yPosition);
      yPosition += 8;
    }
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated by Cyprus Jobs Platform - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 80,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}