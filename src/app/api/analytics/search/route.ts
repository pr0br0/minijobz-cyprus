import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const timeframe = searchParams.get('timeframe') || '30'; // days

    // Get popular search queries (this would require a search analytics table)
    // For now, we'll return mock data based on job titles and locations
    const popularJobs = await db.job.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: {
          gte: new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        title: true,
        location: true,
        type: true,
        remote: true,
        applications: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Get popular locations
    const popularLocations = await db.job.groupBy({
      by: ['location'],
      where: {
        status: 'PUBLISHED',
        createdAt: {
          gte: new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get popular job types
    const popularJobTypes = await db.job.groupBy({
      by: ['type'],
      where: {
        status: 'PUBLISHED',
        createdAt: {
          gte: new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get popular industries (through employers)
    const popularIndustries = await db.job.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: {
          gte: new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        employer: {
          select: {
            industry: true
          }
        }
      }
    });

    // Group by industry
    const industryCounts = popularIndustries.reduce((acc, job) => {
      const industry = job.employer.industry || 'Other';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topIndustries = Object.entries(industryCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Get trending skills
    const trendingSkills = await db.jobSkill.groupBy({
      by: ['skillId'],
      where: {
        job: {
          status: 'PUBLISHED',
          createdAt: {
            gte: new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)
          }
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get skill details
    const skillDetails = await db.skill.findMany({
      where: {
        id: {
          in: trendingSkills.map(ts => ts.skillId)
        }
      },
      select: {
        id: true,
        name: true,
        category: true
      }
    });

    const trendingSkillsWithDetails = trendingSkills.map(ts => {
      const skill = skillDetails.find(s => s.id === ts.skillId);
      return {
        name: skill?.name || 'Unknown',
        category: skill?.category,
        count: ts._count.id
      };
    });

    return NextResponse.json({
      popularSearches: popularJobs.map(job => ({
        query: job.title,
        location: job.location,
        type: job.type,
        remote: job.remote,
        applications: job.applications.length,
        popularity: job.applications.length
      })),
      popularLocations: popularLocations.map(loc => ({
        name: loc.location,
        count: loc._count.id
      })),
      popularJobTypes: popularJobTypes.map(type => ({
        name: type.type,
        count: type._count.id
      })),
      popularIndustries: topIndustries,
      trendingSkills: trendingSkillsWithDetails,
      summary: {
        totalJobs: popularJobs.length,
        timeframe: `${timeframe} days`,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, location, filters, resultsCount } = await request.json();
    
    // Log search analytics (this would typically be stored in a search analytics table)
    // For now, we'll just return success
    
    console.log('Search analytics:', {
      query,
      location,
      filters,
      resultsCount,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging search analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}