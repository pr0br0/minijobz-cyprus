import { NextRequest, NextResponse } from "next/server";

// Legacy Supabase job seeker profile route deprecated. Pending Prisma rewrite.
export async function GET(_request: NextRequest) {
  return NextResponse.json({ error: "Endpoint deprecated", status: 410 }, { status: 410 });
}

export async function PUT(_request: NextRequest) {
  return NextResponse.json({ error: "Endpoint deprecated", status: 410 }, { status: 410 });
}