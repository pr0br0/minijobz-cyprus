import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed unused Prisma enum import

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const skillId = id;    // Check if the job seeker skill exists and belongs to the current user
    const jobSeekerSkill = await db.jobSeekerSkill.findUnique({
      where: {
        id: skillId,
      },
      include: {
        jobSeeker: {
          include: {
            user: true,
          },
        },
        skill: true,
      },
    });

    if (!jobSeekerSkill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    if (jobSeekerSkill.jobSeeker.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get skill info for audit log before deletion
    const skillInfo = {
      skillName: jobSeekerSkill.skill.name,
      skillLevel: jobSeekerSkill.level,
    };

    // Delete the skill
    await db.jobSeekerSkill.delete({
      where: {
        id: skillId,
      },
    });

    // Log the skill deletion for audit trail
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SKILL_REMOVED",
        entityType: "JobSeekerSkill",
        entityId: skillId,
        changes: JSON.stringify(skillInfo),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Skill removed successfully",
    });
  } catch (error) {
    console.error("Error removing skill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}