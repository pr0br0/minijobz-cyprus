import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get recent searches from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSearchesRaw = await db.recentSearch.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to last 10 searches
    });
    const recentSearches = recentSearchesRaw.map(s => ({
      ...s,
      // Parse filters JSON string to object for UI consumption
      filters: s.filters ? safeParseJSON(s.filters) : {},
    }));

    return NextResponse.json({ success: true, searches: recentSearches });

  } catch (error) {
    console.error("Error fetching recent searches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

  const body = await request.json();
  const { query, location, filters } = body;

    // Delete old searches with the same criteria to keep it clean
    await db.recentSearch.deleteMany({
      where: {
        userId: session.user.id,
        query: query || "",
        location: location || "",
      },
    });

    // Create new recent search entry
    const recentSearchCreated = await db.recentSearch.create({
      data: {
        userId: session.user.id,
        query: query || '',
        location: location || '',
        filters: filters ? JSON.stringify(filters) : null,
      },
    });

    // Keep only the last 20 searches
    const allSearches = await db.recentSearch.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (allSearches.length > 20) {
      const searchesToDelete = allSearches.slice(20);
      await db.recentSearch.deleteMany({
        where: {
          id: {
            in: searchesToDelete.map(s => s.id),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      search: {
        ...recentSearchCreated,
        filters: filters || {},
      },
    });

  } catch (error) {
    console.error("Error creating recent search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Local helper to safely parse JSON without throwing
function safeParseJSON(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}