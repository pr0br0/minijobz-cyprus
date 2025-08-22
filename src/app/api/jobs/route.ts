import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      remote,
      type,
      salaryMin,
      salaryMax,
      salaryCurrency,
      applicationEmail,
      applicationUrl,
      expiresAt,
      featured,
      urgent,
      status,
      publishedAt,
      skills,
    } = body;

    // Validate required fields
    if (!title || !description || !location || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, location, and type are required" },
        { status: 400 }
      );
    }

    // Validate salary requirements
    if (!salaryMin && !salaryMax) {
      return NextResponse.json(
        { error: "At least salary minimum or maximum is required" },
        { status: 400 }
      );
    }

    if (salaryCurrency !== "EUR") {
      return NextResponse.json(
        { error: "Salary currency must be EUR (Euro) for Cyprus job postings" },
        { status: 400 }
      );
    }

    if (salaryMin && salaryMax && salaryMin > salaryMax) {
      return NextResponse.json(
        { error: "Minimum salary cannot be greater than maximum salary" },
        { status: 400 }
      );
    }

    // Validate application method
    if (!applicationEmail && !applicationUrl) {
      return NextResponse.json(
        { error: "At least one application method (email or URL) is required" },
        { status: 400 }
      );
    }

  const employer = await db.employer.findUnique({ where: { userId: session.user.id } });
  if (!employer) return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });

    const job = await db.job.create({
      data: {
        employerId: employer.id,
        title,
        description,
        requirements: requirements || null,
        responsibilities: responsibilities || null,
        location,
        remote: remote || 'ONSITE',
        type: type,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        salaryCurrency: salaryCurrency || 'EUR',
        applicationEmail: applicationEmail || null,
        applicationUrl: applicationUrl || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        featured: !!featured,
        urgent: !!urgent,
        status: status || 'DRAFT',
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      }
    });

    // Add skills if provided
    if (skills && Array.isArray(skills) && skills.length) {
      for (const skillName of skills) {
        const trimmed = skillName.trim();
        // Simple case-insensitive match by normalizing to lower
        const existing = await db.skill.findFirst({ where: { name: trimmed } });
        // If not found, create
        const skill = existing || await db.skill.create({ data: { name: trimmed } });
        await db.jobSkill.create({ data: { jobId: job.id, skillId: skill.id } });
      }
    }

    // Log the job creation for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: status === 'PUBLISHED' ? 'JOB_PUBLISHED' : 'JOB_CREATED_DRAFT',
        entityType: 'Job',
        entityId: job.id,
        changes: JSON.stringify({ title, location, type, salaryMin, salaryMax, featured, urgent, skillsCount: skills?.length || 0 }),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      }
    });

    return NextResponse.json({
      message: status === 'PUBLISHED' ? 'Job published successfully' : 'Job saved as draft',
      jobId: job.id,
      status: job.status,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}