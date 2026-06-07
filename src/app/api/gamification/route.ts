import { gamificationService } from "@/services/gamification.service";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await gamificationService.getGamificationData();
  return NextResponse.json(data);
}
