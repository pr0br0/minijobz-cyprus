import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get all skills with optional search
    const skills = await db.skill.findMany({
      where: query ? {
        name: {
          contains: query,
        }
      } : {},
      orderBy: {
        name: 'asc'
      },
      take: limit
    });

    // Get popular skills (most used in job postings)
    const popularSkills = await db.skill.findMany({
      include: {
        _count: {
          select: {
            jobSkills: true
          }
        }
      },
      orderBy: {
        jobSkills: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Group skills by category
    const categories = await db.skill.groupBy({
      by: ['category'],
      where: {
        category: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    return NextResponse.json({
      skills: skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category
      })),
      popularSkills: popularSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        usageCount: skill._count.jobSkills
      })),
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count.id
      }))
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}