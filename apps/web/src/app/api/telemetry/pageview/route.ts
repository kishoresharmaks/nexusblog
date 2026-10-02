import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Telemetry ping received
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
