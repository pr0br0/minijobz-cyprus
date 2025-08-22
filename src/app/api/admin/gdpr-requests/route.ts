import { NextResponse } from 'next/server';

// Deprecated endpoint: GDPR request management removed (no gDPRRequest model in Prisma schema)
// Always respond with 410 Gone so any lingering frontend code can handle gracefully.
export async function GET() {
  return NextResponse.json({ error: 'GDPR request management deprecated' }, { status: 410 });
}