import { NextRequest, NextResponse } from 'next/server';
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

    const raw = await db.savedSearch.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const searches = raw.map(s => ({
      ...s,
      filters: safeParseJSON(s.filters),
    }));
    return NextResponse.json({ success: true, searches });

  } catch (error) {
    console.error("Error fetching saved searches:", error);
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
  const { name, query, location, filters, alertEnabled, alertFrequency } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    const created = await db.savedSearch.create({
      data: {
        userId: session.user.id,
        name: String(name).slice(0, 120),
        query: query || null,
        location: location || null,
        filters: JSON.stringify(filters || {}),
        alertEnabled: !!alertEnabled,
        alertFrequency: toAlertFrequency(alertFrequency),
      },
    });

    return NextResponse.json({
      success: true,
      search: {
        ...created,
        filters: filters || {},
      },
    });

  } catch (error) {
    console.error("Error creating saved search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function safeParseJSON(value: string) {
  try { return JSON.parse(value); } catch { return {}; }
}

function toAlertFrequency(value: string) {
  if (value === 'INSTANT') return 'INSTANT';
  if (value === 'WEEKLY') return 'WEEKLY';
  // Default & invalid fallback
  return 'DAILY';
}