import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    const currentJob = await db.job.findUnique({
      where: { id: jobId, status: 'PUBLISHED' },
      include: {
        employer: true,
        skills: { include: { skill: true } }
      }
    });

    if (!currentJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Collect skill ids
    const skillIds = currentJob.skills.map(js => js.skillId);

    const related = await db.job.findMany({
      where: {
        id: { not: currentJob.id },
        status: 'PUBLISHED',
        OR: [
          { location: currentJob.location },
          { type: currentJob.type },
          { remote: currentJob.remote },
          currentJob.employer?.industry ? { employer: { industry: currentJob.employer.industry } } : undefined,
          skillIds.length ? { skills: { some: { skillId: { in: skillIds } } } } : undefined
        ].filter(Boolean) as any
      },
      include: {
        employer: true
      },
      orderBy: [{ featured: 'desc' }, { urgent: 'desc' }, { createdAt: 'desc' }],
      take: 6
    });

    const jobs = related.map(job => ({
      id: job.id,
      title: job.title,
      location: job.location,
      type: job.type,
      remote: job.remote,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      employer: { companyName: job.employer.companyName }
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching related jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}