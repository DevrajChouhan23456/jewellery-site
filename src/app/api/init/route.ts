import { NextResponse } from "next/server";
import { initializeAutomation } from "@/server/automation-init";

let initialized = false;

export async function GET() {
  if (initialized) {
    return NextResponse.json({ message: 'Already initialized' });
  }

  try {
    await initializeAutomation();
    initialized = true;
    return NextResponse.json({ message: 'Automation initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize automation:', error);
    return NextResponse.json(
      { error: 'Failed to initialize automation' },
      { status: 500 }
    );
  }
}