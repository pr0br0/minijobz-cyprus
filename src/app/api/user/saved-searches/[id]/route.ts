import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

  const body = await request.json();
  const { alertEnabled, alertFrequency, name, filters } = body;

    const { id } = await params;
    const existingSearch = await db.savedSearch.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSearch) {
      return NextResponse.json(
        { error: "Saved search not found" },
        { status: 404 }
      );
    }

    const updated = await db.savedSearch.update({
      where: { id },
      data: {
        ...(alertEnabled !== undefined ? { alertEnabled: !!alertEnabled } : {}),
        ...(alertFrequency ? { alertFrequency: toAlertFrequency(alertFrequency) } : {}),
        ...(name ? { name: String(name).slice(0, 120) } : {}),
        ...(filters ? { filters: JSON.stringify(filters) } : {}),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, search: { ...updated, filters: filters || safeParseJSON(updated.filters) } });

  } catch (error) {
    console.error("Error updating saved search:", error);
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
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existingSearch = await db.savedSearch.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSearch) {
      return NextResponse.json(
        { error: "Saved search not found" },
        { status: 404 }
      );
    }

    await db.savedSearch.delete({
      where: {
        id,
      },
    });

  return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting saved search:", error);
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
  return 'DAILY';
}