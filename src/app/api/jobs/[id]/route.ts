import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
// Removed invalid enum import

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    const job = await db.job.findUnique({
      where: {
        id: jobId,
  status: 'PUBLISHED',
      },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            description: true,
            logo: true,
            website: true,
            industry: true,
            size: true,
            city: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
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

    // Check if job has expired
    if (job.expiresAt && job.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Job has expired" },
        { status: 410 }
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
      createdAt: job.createdAt.toISOString(),
      expiresAt: job.expiresAt?.toISOString(),
      featured: job.featured,
      urgent: job.urgent,
      applicationEmail: job.applicationEmail,
      applicationUrl: job.applicationUrl,
      employer: job.employer,
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
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}