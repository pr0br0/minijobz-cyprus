import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      message: "Cyprus Jobs Platform API is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Health check failed" },
      { status: 500 }
    );
  }
}