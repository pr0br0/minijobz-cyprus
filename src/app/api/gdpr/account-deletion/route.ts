import { NextRequest, NextResponse } from "next/server";

// Legacy Supabase-based account deletion endpoint deprecated after Prisma migration.
// Returning 410 Gone to indicate clients should update to new deletion flow (to be implemented).
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: "This endpoint has been deprecated. Account deletion flow is being migrated.",
      status: 410,
    },
    { status: 410 }
  );
}