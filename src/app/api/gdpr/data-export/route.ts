import { NextRequest, NextResponse } from "next/server";

// Deprecated legacy Supabase-based data export. Use enhanced export route instead.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use /api/gdpr/data-export-enhanced instead.", status: 410 },
    { status: 410 }
  );
}