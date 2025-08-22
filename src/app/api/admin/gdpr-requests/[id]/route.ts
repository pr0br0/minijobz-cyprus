import { NextResponse } from 'next/server';

// Deprecated endpoint: individual GDPR request management removed.
export async function PATCH() {
  return NextResponse.json({ error: 'GDPR request management deprecated' }, { status: 410 });
}