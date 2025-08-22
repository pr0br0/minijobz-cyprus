import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused enum imports; using string literals

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const jobId = id;    // Get employer profile
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

    // Get job with full details
    const job = await db.job.findFirst({
      where: {
        id: jobId,
        employerId: employer.id,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Transform the response
    const transformedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      location: job.location,
      remote: job.remote,
      type: job.type,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      applicationEmail: job.applicationEmail,
      applicationUrl: job.applicationUrl,
      expiresAt: job.expiresAt?.toISOString(),
      featured: job.featured,
      urgent: job.urgent,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      publishedAt: job.publishedAt?.toISOString(),
      skills: job.skills.map((js) => ({
        id: js.skill.id,
        name: js.skill.name,
      })),
      _count: {
        applications: job._count.applications,
      },
    };

    return NextResponse.json(transformedJob);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jobId = id;
    const body = await request.json();
    const { action, ...updateData } = body;

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

    // Check if job exists and belongs to employer
    const existingJob = await db.job.findFirst({
      where: {
        id: jobId,
        employerId: employer.id,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    let updatedJob;
    let actionType = "";

    // Handle different actions
    if (action === "publish") {
      updatedJob = await db.job.update({
        where: { id: jobId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });
      actionType = "JOB_PUBLISHED";
    } else if (action === "pause") {
      updatedJob = await db.job.update({
        where: { id: jobId },
        data: {
          status: 'PAUSED',
        },
      });
      actionType = "JOB_PAUSED";
    } else if (action === "close") {
      updatedJob = await db.job.update({
        where: { id: jobId },
        data: {
          status: 'CLOSED',
        },
      });
      actionType = "JOB_CLOSED";
    } else {
      // Handle general job updates
      const { skills, ...jobData } = updateData;

      // Validate salary currency if provided
      if (jobData.salaryCurrency && jobData.salaryCurrency !== "EUR") {
        return NextResponse.json(
          { error: "Salary must be in EUR (Euro) for Cyprus jobs" },
          { status: 400 }
        );
      }

      // Update job
      updatedJob = await db.job.update({
        where: { id: jobId },
        data: {
          ...jobData,
          salaryMin: jobData.salaryMin ? parseInt(jobData.salaryMin) : undefined,
          salaryMax: jobData.salaryMax ? parseInt(jobData.salaryMax) : undefined,
          expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt) : undefined,
        },
      });

      // Update skills if provided
      if (skills && Array.isArray(skills)) {
        // Remove existing skills
        await db.jobSkill.deleteMany({
          where: { jobId },
        });

        // Add new skills
        for (const skillName of skills) {
          let skill = await db.skill.findUnique({
            where: { name: skillName.trim() },
          });

          if (!skill) {
            skill = await db.skill.create({
              data: {
                name: skillName.trim(),
                category: "General",
              },
            });
          }

          await db.jobSkill.create({
            data: {
              jobId,
              skillId: skill.id,
            },
          });
        }
      }

      actionType = "JOB_UPDATED";
    }

    // Log the action for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: actionType,
        entityType: "Job",
        entityId: updatedJob.id,
        changes: JSON.stringify({
          action,
          updatedFields: Object.keys(updateData),
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      id: updatedJob.id,
      status: updatedJob.status,
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jobId = id;

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

    // Check if job exists and belongs to employer
    const existingJob = await db.job.findFirst({
      where: {
        id: jobId,
        employerId: employer.id,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Delete associated job skills
    await db.jobSkill.deleteMany({
      where: { jobId },
    });

    // Delete the job
    await db.job.delete({
      where: { id: jobId },
    });

    // Log the deletion for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "JOB_DELETED",
        entityType: "Job",
        entityId: jobId,
        changes: JSON.stringify({
          title: existingJob.title,
          location: existingJob.location,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}