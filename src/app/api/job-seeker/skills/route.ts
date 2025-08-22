import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused Prisma enum imports (string literals used)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, level } = body;

    if (!name || !level) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

  const allowedLevels = ['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'];
  if (!allowedLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid skill level" },
        { status: 400 }
      );
    }

    // Check if job seeker profile exists
    const jobSeeker = await db.jobSeeker.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    // Find or create the skill
    let skill = await db.skill.findUnique({
      where: {
        name: name.trim(),
      },
    });

    if (!skill) {
      skill = await db.skill.create({
        data: {
          name: name.trim(),
          category: "General", // Default category
        },
      });
    }

    // Check if job seeker already has this skill
    const existingJobSeekerSkill = await db.jobSeekerSkill.findUnique({
      where: {
        jobSeekerId_skillId: {
          jobSeekerId: jobSeeker.id,
          skillId: skill.id,
        },
      },
    });

    if (existingJobSeekerSkill) {
      return NextResponse.json(
        { error: "You already have this skill" },
        { status: 400 }
      );
    }

    // Add skill to job seeker
    const jobSeekerSkill = await db.jobSeekerSkill.create({
      data: {
        jobSeekerId: jobSeeker.id,
        skillId: skill.id,
        level: level,
      },
      include: {
        skill: true,
      },
    });

    // Log the skill addition for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SKILL_ADDED",
        entityType: "JobSeekerSkill",
        entityId: jobSeekerSkill.id,
        changes: JSON.stringify({
          skillName: skill.name,
          skillLevel: level,
        }),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      id: jobSeekerSkill.id,
      name: jobSeekerSkill.skill.name,
      level: jobSeekerSkill.level,
      message: "Skill added successfully",
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { skillId, level } = body;
    if (!skillId) {
      return NextResponse.json({ error: 'Missing skillId' }, { status: 400 });
    }
    const jobSeeker = await db.jobSeeker.findUnique({ where: { userId: session.user.id } });
    if (!jobSeeker) {
      return NextResponse.json({ error: 'Job seeker profile not found' }, { status: 404 });
    }
    const jobSeekerSkill = await db.jobSeekerSkill.findUnique({ where: { jobSeekerId_skillId: { jobSeekerId: jobSeeker.id, skillId } } });
    if (!jobSeekerSkill) {
      return NextResponse.json({ error: 'Skill not found on profile' }, { status: 404 });
    }
    const updates: any = {};
    if (level) {
      const allowedLevels = ['BEGINNER','INTERMEDIATE','ADVANCED','EXPERT'];
      if (!allowedLevels.includes(level)) {
        return NextResponse.json({ error: 'Invalid skill level' }, { status: 400 });
      }
      updates.level = level;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    const updated = await db.jobSeekerSkill.update({ where: { id: jobSeekerSkill.id }, data: updates, include: { skill: true } });
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'SKILL_UPDATED',
        entityType: 'JobSeekerSkill',
        entityId: updated.id,
        changes: JSON.stringify(updates),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });
    return NextResponse.json({ id: updated.id, name: updated.skill.name, level: updated.level });
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}